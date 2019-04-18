/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#pragma once

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
#include <boost/algorithm/string.hpp>

using namespace eosio;

class[[eosio::contract]] BlockCoined : public contract
{
 public:
   using contract::contract;

   /// @abi action
   /// Create a new game
   /*[[eosio::action]]
      void create(const name& challenger, const name& host); */

   /// @abi action
   /// Restart a game
   /// @param by the name who wants to restart the game
   //[[eosio::action]] void restart(const name &challenger, const name &host, const name &by);

   /// @abi action
   /// Close an existing game, and remove it from storage
   [[eosio::action]] void close(const name &challenger, const name &host);

   /// @abi action
   /// Make movement
   /// @param by the name who wants to make the move
   [[eosio::action]] void move(const name &host, const name &by, const uint16_t &cell_cicked1, const uint16_t &cell_cicked2);

   //Host create BlockCoined Board
   [[eosio::action]] void createjgames(const name &host);

   //action to join game as a challenger
   [[eosio::action]] void joinhostgame(const name &host, const name &challenger);

   [[eosio::action]] void buyqueue(const name &host, const name &buyer, const uint16_t &quantity);

   [[eosio::action]] void stealturn(const name &host, const name &by);

   [[eosio::action]] void refundtoken(const name host, const name challenger);

   int i = 0;
   int j = 0;
   int num = 8;
   static const uint16_t board_width = 8;
   static const uint16_t board_height = board_width;
   int num_unique_char = 5;

   struct [[eosio::table]] anima_index
   {
      uint16_t level = 0;
      uint16_t orientation = 0; //vector in struct are rows or columns
      uint16_t pos_num;         //position of this vector on board
      std::vector<char> view;
      std::vector<char> empty;
      std::vector<uint16_t> board_index;
      uint64_t index = 0;
      anima_index()
      {
         view.resize(8, 0);
         empty.resize(8, 0);
         board_index.resize(8, 0);
      }
      uint64_t primary_key() const { return index; }
      EOSLIB_SERIALIZE(anima_index, (level)(orientation)(pos_num)(view)(empty)(board_index)(index))
   };

   struct [[eosio::table]] playertickets
   {                           //token pays for player tickets/ tickets buy Qs. Unused ticket can be refunded.
      uint16_t num_ticket = 0; //potential turns
      name challenger;
      uint64_t primary_key() const { return challenger.value; }
      EOSLIB_SERIALIZE(playertickets, (num_ticket)(challenger))
   };

   struct [[eosio::table]] challenger_index
   {
      name challenger = "none"_n;
      unsigned int score = 0; //look up table for challenger names
      uint64_t primary_key() const { return challenger.value; }
      EOSLIB_SERIALIZE(challenger_index, (challenger)(score))
   };

   struct [[eosio::table]] game_queue_table
   {
      unsigned int index = 0;     //look up table for player queued order
      name challenger = "none"_n; //player name is the will be the account name queued up next turn
      uint64_t primary_key() const { return index; }
      EOSLIB_SERIALIZE(game_queue_table, (challenger)(index))
   };

   struct [[eosio::table]] game_list
   {                               //store a list of all instantiated block_jewel
      uint16_t tot_num_ticket = 0; //total number of turns aka token locked in the current game
      name host;
      uint64_t primary_key() const { return host.value; }
      EOSLIB_SERIALIZE(game_list, (tot_num_ticket)(host))
   };

   struct [[eosio::table]] block_jewel
   {
      typedef eosio::multi_index<"challengers"_n, challenger_index> chalindex;
      typedef eosio::multi_index<"gamequeue"_n, game_queue_table> queue_table;

      //boost::multi_array<char, 2> board_t{boost::extents[8][8]};

      name host;
      name turn;              // = name name of host/ challenger
      name winner = "none"_n; // = none/ draw/ name of host/ name of challenger

      std::vector<char> board;
      std::vector<uint16_t> board_index;

      uint16_t host_score = 0;
      unsigned int state = 0; //0-idle empty queue 1-queued waiting for click 2-running score check  3-complete
      uint16_t Queue_pos = 1; //Pointer for Queue position last added
      uint16_t Queue_pos_max = 50;
      uint16_t Game_turn = 1;
      int block_num = 0;
      int time_out_limit = 60;
      int board_index_value = 63;

      //multi_array board{boost::extents[board_width][board_height]};
      block_jewel()
      {
         initialize_board();
         //print( "constructor ran. \n");
         /*for_each(board.begin(), board.end(), [&](char a) { 
              //print("begin");
              print(a);});
              print( "Index: ");
              for_each(board_index.begin(), board_index.end(), [&](uint16_t b) { 
              //print("begin");
              int index = b;});*/
         //print(" ", std::to_string(index));
         //print("end \n");
         //challenger_scores(21, 0);
         //challengers(21, "none"_n);
      }
      // Initialize board with empty cell
      void initialize_board()
      {
         int r;
         char jewel;
         time_t timer;

         //std::string toHash;
         //checksum256 calc_hash;
         //random_roll = sha256(&calc_hash, toHash.size() * sizeof(char));
         char seed;
         char seed2;

         capi_checksum256 random_num_hash;
         capi_checksum256 random_num_hash2;
         uint64_t p64;

         // initialize the random number generator
         for (int j = 0; j < board_height; j++)
         {
            for (int i = 0; i < board_width; i++)
            {

               seed = current_time() + host.value + 123879;
               seed2 = current_time() + host.value + 124329;
               //random_num_hash = sha256( &seed, sizeof(seed) );
               sha256((char *)&seed, sizeof(seed) * 2, &random_num_hash);
               sha256((char *)&seed2, sizeof(seed2) * 2, &random_num_hash2);

               //p64 = reinterpret_cast<uint64_t>(random_num_hash);
               if ((i + j * 8) < 32)
               {
                  r = (random_num_hash.hash[i + j * 8] + random_num_hash.hash[i + j * 8 + 1] + random_num_hash.hash[i + j * 8 + 2] + random_num_hash.hash[i + j * 8 + 3] + random_num_hash.hash[i + j * 8 + 4] + random_num_hash.hash[i + j * 8 + 5]) % 5; // generate a random number
                  //board[i][j] = 'A' + r;
                  jewel = 'A' + r;
                  board.push_back(jewel);
                  board_index.push_back(i + j * board_height);
               }
               //i+j*board_height
               else
               {
                  r = (random_num_hash2.hash[i + j * 8 - 32] + random_num_hash2.hash[i + j * 8 - 31] + random_num_hash2.hash[i + j * 8 - 30] + random_num_hash2.hash[i + j * 8 - 29] + random_num_hash2.hash[i + j * 8 - 28] + random_num_hash2.hash[i + j * 8 - 27]) % 5; // generate a random number
                  //board[i][j] = 'A' + r;
                  jewel = 'A' + r;
                  board.push_back(jewel);
                  board_index.push_back(i + j * board_height);
                  //i+j*board_height
               }
               //print("\n char is :", (jewel));
               //print("\n board is :", board[i*8+j]);            // Convert to a character from a-z
               //std::cout << a[i][j];
               //challengers.push_back("none"_n);
               //challenger_scores.push_back(0);
            }
            //std::cout<<"\n________________________________\n";
            //print( "init board ran. \n");
         }
      }

      // Reset game
      void reset_game()
      {
         initialize_board();
         turn = host;
         winner = "none"_n;
      }

      uint64_t primary_key() const { return host.value; }

      EOSLIB_SERIALIZE(block_jewel, (host)(turn)(winner)(board)(board_index)(host_score)(Queue_pos)(Queue_pos_max)(Game_turn)(block_num)(board_index_value))
   };

   typedef eosio::multi_index<"jgames"_n, block_jewel> jgames;
   typedef eosio::multi_index<"animaindex"_n, anima_index> animaindex;
   typedef eosio::multi_index<"tickettable"_n, playertickets> ticketlist;
   typedef eosio::multi_index<"gamelist"_n, game_list> gamelist;

   void transfer_action(const name buyer, const name reciever, const asset quantity, const std::string memo);

 private:
   std::queue<int> myqueue;

   //array for manipulation
   boost::multi_array<char, 2> board{boost::extents[num][num]};
   typedef boost::multi_array<char, 2>::array_view<1>::type array_view;
   typedef boost::multi_array_types::index_range range;
   range a_range = range().start(0).finish(num).stride(1);

   struct view_p
   {
      bool row_or_column = true;
      int number = 1;
   };

   typedef view_p view_pos;

   //int score_tot1 = 0;
   std::queue<view_pos> view_queue;

   std::vector<bool> mark_del(array_view & view_line, int board_width);
   void transform(const std::vector<char> &board);    //set matrix board
   void inverse_transform(std::vector<char> & board); //set vector board
   array_view get_view(bool row_or_col, int index);
   void set_board_from_view(const array_view view, bool row_or_col, int index);

   int get_score(const name &host, const name &challenger, block_jewel &current_game, const uint16_t &cell_cicked1, const uint16_t &cell_cicked2);
   std::string ran_char(int mod_int, char &sudo_seed, int num_char, int nounce);
   int check_score(std::vector<bool> & mark_del, std::vector<char> & view_row);
   void delete_marked_then_fill(block_jewel & current_game, const std::vector<bool> mark_del, std::vector<char> &temp_vec, std::vector<uint16_t> &board_index, int nounce);
   //void check_delete_and_fill( std::vector<char>& view, int& score,std::vector<bool>& mark_del);

   void print_view(array_view & view);
   void print_vector(std::vector<char> & view);
   void print_vector_bool(const std::vector<bool> &view);
   void print_board(boost::multi_array<char, 2> & a);
   void compare_vec(std::vector<char> & V1, std::vector<char> & V2, std::vector<bool> & result_diff);

   void process_vector_queue(std::queue<view_pos> & vector_queue, block_jewel & current_game, int &score_tot, animaindex &animation_table, const int &index_processing, const name &anima_payer);

   //void add_player( block_jewel& current_game, name player_name, unsigned int player_score );

   name get_winner(const BlockCoined::block_jewel &current_game, const name &host);
   name get_player_from_queue(const block_jewel &current_game, const name &host);
   int check_set_game_state(const name &host);
   bool is_queue_empty(const name &host);
   void set_score(const name &host, const name &by, unsigned int score);
   void enqueue(const name &host, const name &buyer);
   void pop_queue(const name &host);
};
/// @}
