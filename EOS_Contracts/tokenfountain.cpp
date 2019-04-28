/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>

#include <string>
#include <ctime>
#include <eosiolib/types.h>
#include <eosiolib/crypto.h>

#include <utility>
#include <vector>
#include <queue>
#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/time.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/contract.hpp>

#include <eosiolib/transaction.hpp>
#include <eosiolib/crypto.h>
//#include <boost/algorithm/string.hpp>

using namespace eosio;

//This contract will distribute token at a limited rate of every 86400 seconds 50 tokens. Players can claim 50 tokens once 86400 seconds has been passed.
//Once all tokens issued to this contract has been claimed, the token contract will stop issuing tokens permenantly.

class[[eosio::contract]] TokenFountain : public contract
{
  public:
    using contract::contract;

    struct [[eosio::table]] claimed_info
    {
        uint64_t last_claimed_time;
        name recipient;
        uint64_t primary_key() const { return recipient.value; }
        EOSLIB_SERIALIZE(claimed_info, (last_claimed_time)(recipient))
    };
    typedef eosio::multi_index<"claiminfo"_n, claimed_info> claim_t;

    struct claim_st
    {
        int num_of_claimable_token; //keep track of initial surplus token in this contract; when token is deposited into this contract, this number will be smaller than the total token holding int this contract.
        name contract;
        uint64_t primary_key() const { return contract.value; }
        EOSLIB_SERIALIZE(claim_st, (contract)(num_of_claimable_token))
    };
    typedef eosio::multi_index<"claimtoken"_n, claim_st> claim_num;
    //@abi table accounts i64
    struct account
    {
        asset balance;
        uint64_t primary_key() const { return balance.symbol.code().raw(); }
    };
    typedef eosio::multi_index<"accounts"_n, account> accounts;

    [[eosio::action]] void claim(name recipient) {
        claim_num claim_token(_self, _self.value);
        auto itr_c = claim_token.find(_self.value);
        if (itr_c == claim_token.end())
        {
            print("did not find table ");
            claim_token.emplace(_self, [&](auto &row) { row.contract = _self; row.num_of_claimable_token = 15000000; });
        }
        itr_c = claim_token.find(_self.value);
        int num_of_claimable_token = itr_c->num_of_claimable_token;
        accounts accountstable("blocointoken"_n, _self.value);
        eosio::symbol symbol("BLC", 4);
        const auto &ac = accountstable.get(symbol.code().raw());
        asset amount(500000, eosio::symbol("BLC", 4));
        asset claimable_amount(num_of_claimable_token * 10000, eosio::symbol("BLC", 4));
        //number_of_claimable token has more than 100 tokens available
        //eosio_assert(ac.balance > amount.balance, "free token claim period has ended");
        print("current fountain account has: ", ac.balance.amount);
        print("claimable amount is: ", claimable_amount.amount);
        eosio_assert(claimable_amount.amount <= ac.balance.amount, "cannot claim token as of now");
        require_auth(recipient);
        uint64_t timestamp = now();
        //uint32_t block_number = tapos_block_num();
        claim_t existing_claimed_table(_self, _self.value);
        auto itr = existing_claimed_table.find(recipient.value);
        if (itr == existing_claimed_table.end())
        {
            existing_claimed_table.emplace(recipient, [&](auto &row) { row.last_claimed_time = timestamp; 
            row.recipient = recipient; });
        }
        else
        {
            eosio_assert(itr->last_claimed_time + 86400 < timestamp, "please wait one day until each claim");
            existing_claimed_table.modify(itr, recipient, [&](auto &row) { row.last_claimed_time = timestamp; });
        }
        //send token 100 tokens to recipient from this contract below
        action(
            permission_level{get_self(), "active"_n},
            "blocointoken"_n,
            "transfer"_n,
            std::make_tuple(_self, recipient, amount, std::string("from fountain")))
            .send();

        claim_token.modify(itr_c, _self, [&](auto &row) { row.num_of_claimable_token -= 100; });
        //claim_token.erase(itr_c);
    }

        [[eosio::action]] void
        close(name host)
    {
        require_auth(host);
        claim_num claim_token(_self, host.value);
        auto itr_temp = claim_token.begin();
        while (itr_temp != claim_token.end())
        {
            itr_temp = claim_token.erase(itr_temp);
        }
        claim_t existing_claimed_table(_self, host.value);
        auto itr_temp2 = existing_claimed_table.begin();
        while (itr_temp2 != existing_claimed_table.end())
        {
            itr_temp2 = existing_claimed_table.erase(itr_temp2);
        }
    }
};
EOSIO_DISPATCH(TokenFountain, (claim)(close))