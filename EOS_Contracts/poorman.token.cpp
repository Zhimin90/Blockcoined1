/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */

#include "poorman.token.hpp"

namespace eosio {

void token::create( name issuer,
                    asset        maximum_supply )
{
    require_auth( _self );

    auto sym = maximum_supply.symbol;
    eosio_assert( sym.is_valid(), "invalid symbol name" );
    eosio_assert( maximum_supply.is_valid(), "invalid supply");
    eosio_assert( maximum_supply.amount > 0, "max-supply must be positive");

    stats statstable( _self, sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    eosio_assert( existing == statstable.end(), "token with symbol already exists" );

    statstable.emplace( _self, [&]( auto& s ) {
       s.supply.symbol = maximum_supply.symbol;
       s.max_supply    = maximum_supply;
       s.issuer        = issuer;
    });
}


void token::issue( name to, asset quantity, string memo )
{
    do_issue(to,quantity,memo,true);
}

void token::issuefree( name to, asset quantity, string memo )
{
    do_issue(to,quantity,memo,false);
}

void token::burn( name from, asset quantity, string memo )
{
    auto sym = quantity.symbol;
    eosio_assert( sym.is_valid(), "invalid symbol name" );
    eosio_assert( memo.size() <= 256, "memo has more than 256 bytes" );

    auto sym_name = sym.code().raw();
    stats statstable( _self, sym_name );
    auto existing = statstable.find( sym_name );
    eosio_assert( existing != statstable.end(), "token with symbol does not exist, create token before burn" );
    const auto& st = *existing;

    require_auth( from );
    require_recipient( from );
    eosio_assert( quantity.is_valid(), "invalid quantity" );
    eosio_assert( quantity.amount >= 0, "must burn positive or zero quantity" );

    eosio_assert( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    eosio_assert( quantity.amount <= st.supply.amount, "quantity exceeds available supply");

    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply -= quantity;
    });

    sub_balance( from, quantity );
}

void token::signup( name owner, asset quantity)
{
    auto sym = quantity.symbol;
    eosio_assert( sym.is_valid(), "invalid symbol name" );

    auto sym_name = sym.code().raw();
    stats statstable( _self, sym_name );
    auto existing = statstable.find( sym_name );
    eosio_assert( existing != statstable.end(), "token with symbol does not exist, create token before signup" );
    const auto& st = *existing;

    require_auth( owner );
    require_recipient( owner );

    accounts to_acnts( _self, owner.value );
    auto to = to_acnts.find( sym_name );
    eosio_assert( to == to_acnts.end() , "you have already signed up" );

    eosio_assert( quantity.is_valid(), "invalid quantity" );
    eosio_assert( quantity.amount == 0, "quantity exceeds signup allowance" );
    eosio_assert( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    eosio_assert( quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply += quantity;
    });

    add_balance( owner, quantity, owner );
}

void token::transfer( name from, name to, asset quantity, string memo )
{
  do_transfer(from,to,quantity,memo,true);
}

void token::transferfree( name from, name to, asset quantity, string memo )
{
  do_transfer(from,to,quantity,memo,false);
}

void token::do_issue( name to, asset quantity, string memo, bool pay_ram )
{
    auto sym = quantity.symbol;
    eosio_assert( sym.is_valid(), "invalid symbol name" );
    eosio_assert( memo.size() <= 256, "memo has more than 256 bytes" );

    auto sym_name = sym.code().raw();
    stats statstable( _self, sym_name );
    auto existing = statstable.find( sym_name );
    eosio_assert( existing != statstable.end(), "token with symbol does not exist, create token before issue" );
    const auto& st = *existing;

    require_auth( st.issuer );
    eosio_assert( quantity.is_valid(), "invalid quantity" );
    eosio_assert( quantity.amount >= 0, "must issue positive quantity or zero" );

    eosio_assert( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    eosio_assert( quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply += quantity;
    });

    add_balance( st.issuer, quantity, st.issuer );

    if( to != st.issuer ) {
      if(pay_ram == true) {
        SEND_INLINE_ACTION( *this, transfer, {st.issuer,"active"_n}, {st.issuer, to, quantity, memo} );
      } else {
        SEND_INLINE_ACTION( *this, transferfree, {st.issuer,"active"_n}, {st.issuer, to, quantity, memo} );
      }
    }
}

void token::do_transfer( name from, name to, asset quantity, string memo, bool pay_ram)
{
  eosio_assert( from != to, "cannot transfer to self" );
  require_auth( from );
  eosio_assert( is_account( to ), "to account does not exist");
  auto sym = quantity.symbol.code().raw();
  stats statstable( _self, sym );
  const auto& st = statstable.get( sym );

  require_recipient( from );
  require_recipient( to );

  eosio_assert( quantity.is_valid(), "invalid quantity" );
  eosio_assert( quantity.amount > 0, "must transfer positive quantity" );
  eosio_assert( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
  eosio_assert( memo.size() <= 256, "memo has more than 256 bytes" );


  sub_balance( from, quantity );
  add_balance( to, quantity, from, pay_ram );
}

void token::sub_balance( name owner, asset value ) {
   accounts from_acnts( _self, owner.value );

   const auto& from = from_acnts.get( value.symbol.code().raw(), "no balance object found" );
   eosio_assert( from.balance.amount >= value.amount, "overdrawn balance" );


   if( from.balance.amount == value.amount ) {
      from_acnts.erase( from );
   } else {
      from_acnts.modify( from, owner, [&]( auto& a ) {
          a.balance -= value;
      });
   }
}

void token::add_balance( name owner, asset value, name ram_payer, bool pay_ram )
{
   accounts to_acnts( _self, owner.value );
   auto to = to_acnts.find( value.symbol.code().raw() );
   if( to == to_acnts.end() ) {
      eosio_assert(pay_ram == true, "destination account does not have balance");
      to_acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = value;
      });
   } else {
      to_acnts.modify( to, same_payer, [&]( auto& a ) {
        a.balance += value;
      });
   }
}

} /// namespace eosio

EOSIO_DISPATCH( eosio::token, (create)(issue)(issuefree)(burn)(signup)(transfer)(transferfree) )
