/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#include <boost/multi_array.hpp>
#include "BlockCoined.hpp"
#include <queue>
using namespace std;
using namespace eosio;

char rand()
{
   capi_checksum256 result;
   auto mixedBlock = tapos_block_prefix() * tapos_block_num();
   char r;
   const char *mixedChar = reinterpret_cast<const char *>(&mixedBlock);
   sha256((char *)mixedChar, sizeof(mixedChar), &result);
   const char *p64 = reinterpret_cast<const char *>(&result);

   for (int i = 0; i < 6; i++)
   {
      r = (abs((int64_t)p64[i]) % (49 + 1 - 1)) + 1;
   }
   return r;
}

string BlockCoined::ran_char(int mod_int, char &sudo_seed, int num_char, int nounce)
{
   char prev_sudo_seed = sudo_seed;
   //print( "ran_char_start\n ");
   int r;
   std::string jewels;
   time_t timer;

   char seed;
   capi_checksum256 random_num_hash;
   uint64_t p64;

   // initialize the random number generator
   //print( "curent time is: ", std::to_string( current_time() ));
   //print( "\n ");
   auto mixedBlock = tapos_block_prefix() * tapos_block_num();
   const char *mixedChar = reinterpret_cast<const char *>(&mixedBlock);
   seed = current_time() + mixedChar[0] + nounce;
   //random_num_hash = sha256( &seed, sizeof(seed) );
   sha256((char *)&seed, sizeof(seed) * 2, &random_num_hash);
   int random = sudo_seed % 32 - 1;
   //print( "curent sudo_seed is: ", std::to_string( sudo_seed ));
   //print( "\n ");
   //print( "curent hash is: ", std::to_string( random_num_hash.hash[random] ));
   //print( "\n ");
   std::string inserted_str;
   if (num_char < 32)
   {
      for (int i = 0; i < num_char; i++)
      {
         inserted_str[i + 1] = random_num_hash.hash[i] % mod_int + 'A'; // generate a random number
      }
   }
   //print( "generated is: ",   inserted_str);
   sudo_seed = sudo_seed + 1;

   return (inserted_str);
}

int BlockCoined::check_score(vector<bool> &mark_del, vector<char> &view_row)
{
   int k = 0;
   int scored = 0;
   //print( "BlockCoined::check score\n ");

   //Find and mark scored block to be deleted
   for (int i = 1; i < this->num - 1; i++)
   {
      if (view_row[i] == view_row[i - 1])
      {
         if (view_row[i] == view_row[i + 1])
         {
            scored++;
            mark_del[i] = 1;
            mark_del[i - 1] = 1;
            mark_del[i + 1] = 1;

            for (k = i + 2; k < this->num - 1; k++)
            {
               if (view_row[i] == view_row[k])
               {
                  scored++;
                  mark_del[k] = 1;
               }
               else
               {
                  break;
               }
            }
            if (scored > 1)
            {
               i = k;
            }
         }
      }
   }
   return scored;
}

void BlockCoined::delete_marked_then_fill(block_jewel &current_game, const vector<bool> mark_del, vector<char> &temp_vec, vector<uint16_t> &board_index, int nounce)
{
   //print( "BlockCoined::delete_marked_then_fill\n ");
   //print( "BlockCoined::delete_marked_then_fill before erase");
   /*print_vector_bool(mark_del);
   print( "\n ");
   print_vector(temp_vec);
   print( "\n ");
    print("index in before erase is:");
        for_each(board_index.begin(),board_index.end(), [](uint16_t b){print(" ", std::to_string(b));});
        print("\n");*/
   int row_index = 0;
   for_each(mark_del.begin(), mark_del.end(), [&](bool del) {
      if (del)
      {
         // std :: vector :: erase function call
         // erase the first 3 elements of vector vector
         //cout << row_index;
         temp_vec.erase(temp_vec.begin() + row_index, temp_vec.begin() + row_index + 1);
         board_index.erase(board_index.begin() + row_index, board_index.begin() + row_index + 1);
         //board_index.erase(temp_vec.begin()+row_index, temp_vec.begin() + row_index + 1);
         row_index--;
      }
      row_index++;
   });

   //print view_row
   //cout << '\n';
   //for_each(temp_vec.begin(), temp_vec.end(), [](char a) { cout << a << ' '; });
   //cout << '\n';
   //cout << num - temp_vec.size() << '\n';
   std::string sudo_seed = "";
   char sudo_seed_char = 'f';
   //insert random char
   int push_count = num - temp_vec.size();

   sudo_seed = ran_char(num_unique_char, sudo_seed_char, push_count, nounce);
   //print("psueudo seed is: ");
   uint16_t index = current_game.board_index_value;
   for (int i = 0; i < push_count; i++)
   {
      index++;
      print(sudo_seed[i + 1]);
      temp_vec.insert(temp_vec.begin(), sudo_seed[i + 1]);
      board_index.insert(board_index.begin(), index);
      //print("index is: ", std::to_string(current_game.board_index_value++));
   }
   current_game.board_index_value = index;
   /*print("\n");
  print("index in del  is:");
        for_each(board_index.begin(),board_index.end(), [](uint16_t b){print(" ", std::to_string(b));});
        print("\n");*/
   //for_each(temp_vec.begin(), temp_vec.end(), [](char a) { cout << a << ' '; });
   //cout << '\n';
   //print("pushed str: ", sudo_seed);
   //print( "BlockCoined::delete_marked_then_fill after erase");
   // print_vector(temp_vec);
   //print( "\n ");
}

void BlockCoined::print_view(array_view &view)
{
   //cout << '\n';
   //cout << "view is: ";
   //for_each(view.begin(), view.end(), [](char b){cout<<b<<' ';}
   // );
   //cout << '\n';
}

void BlockCoined::print_vector(vector<char> &view)
{
   print("\n vector is: ");
   //cout << "vector is: ";
   for_each(view.begin(), view.end(), [](char b) { print(b); });
   print("\n ");
}

void BlockCoined::print_vector_bool(const vector<bool> &view)
{
   print("\n vector bool is: ");
   for_each(view.begin(), view.end(), [](bool b) { print(" ", b); });
   print("\n ");
}

void BlockCoined::print_board(boost::multi_array<char, 2> &a)
{
   /*std::cout<<"\n______________________________________________________\n";
  std::cout << '\n';

  array_view view_col = a[boost::indices[a_range][0]];
  array_view view_row = a[boost::indices[0] [a_range]];

  //a[boost::indices[a_range][1]] = view_col;

  //Print 8x8 Block to Console
  int block_label = 0;
  for (int i=0; i<num; i++){
    array_view view = a[boost::indices[i][a_range]];
    for_each(view.begin(), view.end(), [&](char b) { 
      block_label++;
      cout << b <<' ';
  if (block_label < 10){
   //cout << '0';
  }
      //cout << block_label <<' ';
    });
    std::cout << '\n';
  }

  //For get view of selected row or column
  std::cout<<"\n______________________________________________________\n";*/
}

void BlockCoined::compare_vec(vector<char> &V1, vector<char> &V2, vector<bool> &result_diff)
{
   //vector<bool> result_diff(num, false);
   print("compare_vec\n ");
   int index = 0;
   for_each(V1.begin(), V1.end(), [&](char b) {if (V1[index] != V2[index]){
    result_diff[index]=1;}index++; });
}

void BlockCoined::process_vector_queue(std::queue<view_pos> &vector_queue, block_jewel &current_game, int &score_tot, animaindex &animation_index_table, const int &anima_index, const name &anima_payer)
{
   vector<char> temp_vec1(num, 0);           //original
   vector<char> temp_vec2(num, 0);           //processed
   vector<uint16_t> temp_vec1_index(num, 0); //original
   vector<uint16_t> temp_vec2_index(num, 0); //processed
   vector<bool> compare_result(num, 0);
   vector<bool> deleted_result(num, 0);

   int count = 0;
   int score_single_pass = 0;
   int index = 0;

   //animation tracking logic
   unsigned int row_index;
   unsigned level;
   //check if this is the first animation emplace
   if (animation_index_table.begin() != animation_index_table.end())
   {
      auto itr_anima = animation_index_table.end(); //last level
      itr_anima--;
      row_index = itr_anima->index;
      level = itr_anima->level + 1; //level of nested vector diff check
   }                                //increment from last index
   else
   { //if it is first
      auto itr_anima = animation_index_table.begin();
      row_index = 0;                //if first in the table initiate index
      level = itr_anima->level + 1; //level of nested vector diff check
   }

   print("queue processing 1\n ");
   if (!vector_queue.empty())
   {
      view_pos current_process = vector_queue.front();
      if (current_process.row_or_column)
      {
         //array_view view_row = board[boost::indices[current_process.number - 1] [a_range]];
         //current_game.board[current_process.number - 1]
         //copy view into vector
         /*std::memcpy(&temp_vec2[0], &current_game.board[(current_process.number - 1) * num], num);
        std::memcpy(&temp_vec2_index[0], &current_game.board_index[(current_process.number - 1) * num ], num);*/
         index = 0;
         for_each(temp_vec2.begin(), temp_vec2.end(), [&](char b) {
           temp_vec2[index]= current_game.board[index + num*(current_process.number - 1)];
           temp_vec2_index[index]= current_game.board_index[index + num*(current_process.number - 1)];
           index++; });
         //print("row index before func into board is:");
         //for_each(temp_vec2_index.begin(),temp_vec2_index.end(), [](uint16_t b){print(" ", std::to_string(b));});
         //print("\n");
         /*
        print( "queue processing copied board is : ");
        print_vector(current_game.board);
        print( "\n ");
         print( "queue processing copied row vector is : ");
           print_vector(temp_vec2);
           print( "\n ");*/
         //save pre-processed vector
         std::memcpy(&temp_vec1[0], &temp_vec2[0], num);
         score_single_pass = check_score(deleted_result, temp_vec2);
         while (score_single_pass > 0)
         {
            //print_vector(temp_vec2);
            score_tot = score_tot + score_single_pass;
            delete_marked_then_fill(current_game, deleted_result, temp_vec2, temp_vec2_index, score_tot);
            //check_delete_and_fill( temp_vec2, score_single_pass , deleted_result);
            //print("delete result ", std::to_string(delete_result));
            print(" \n ");
            score_single_pass = check_score(deleted_result, temp_vec2);
            print_vector(temp_vec2);
            //insert into animation table
            row_index++;
            animation_index_table.emplace(anima_payer, [&](auto &rowindex) {
               rowindex.index = row_index;
               rowindex.level = level;
               if (current_process.row_or_column)
               {
                  rowindex.orientation = 0;
               }
               else
               {
                  rowindex.orientation = 1;
               }
               rowindex.pos_num = current_process.number;
               std::memcpy(&rowindex.view[0], &temp_vec2[0], num);
               index = 0;
               for_each(temp_vec2_index.begin(), temp_vec2_index.end(), [&](uint16_t b) {
                rowindex.board_index[index]= b;
           index++; });
               //std::memcpy(&rowindex.board_index[0], &temp_vec2_index[0], num);
               int counter = 0;

               for_each(deleted_result.begin(), deleted_result.end(), [&](bool del) {
                  //print(std::to_string(del));
                  if (del)
                  {
                     rowindex.empty[counter] = '@';
                  }
                  counter++;
               });
            });
         }
         //copy back into board
         /*print("index before merging into board is:");
        for_each(temp_vec2_index.begin(),temp_vec2_index.end(), [](uint16_t b){print(" ", std::to_string(b));});
        print("\n");*/
         index = 0;
         for_each(temp_vec2.begin(), temp_vec2.end(), [&](char b) {
           current_game.board[index + num*(current_process.number - 1)] = temp_vec2[index];
           current_game.board_index[index + num*(current_process.number - 1)] = temp_vec2_index[index];
           index++; });
         //std::memcpy(&current_game.board[(current_process.number - 1) * num ], &temp_vec2[0], num);
         //std::memcpy(&current_game.board_index[(current_process.number - 1) * num ], &temp_vec2_index[0], num);
         //save into board
         //board[boost::indices[current_process.number - 1] [a_range]] = view_row;
         vector_queue.pop();
         //print_view(view_row);
         //print( "view row is: ");
         print("queue processing 2\n ");
         //print( "\n ");
      }
      else
      {
         index = 0;
         //array_view view_col = board[boost::indices[a_range][current_process.number - 1]];
         //copy board column to vector
         for_each(temp_vec2.begin(), temp_vec2.end(), [&](char b) {
           temp_vec2[index]= current_game.board[index*num + current_process.number - 1];
           temp_vec2_index[index]= current_game.board_index[index*num + current_process.number - 1];
           index++; });
         //print("column index before func into board is:");
         //for_each(temp_vec2_index.begin(),temp_vec2_index.end(), [](uint16_t b){print(" ", std::to_string(b));});
         //print("\n");
         /*print( "queue processing copied column vector is : ");
           print_vector(temp_vec2);
           print( "\n ");*/
         //save pre-processed vector
         std::memcpy(&temp_vec1[0], &temp_vec2[0], num);
         score_single_pass = check_score(deleted_result, temp_vec2);

         while (score_single_pass > 0)
         {
            print_vector(temp_vec2);
            score_tot = score_tot + score_single_pass;
            delete_marked_then_fill(current_game, deleted_result, temp_vec2, temp_vec2_index, score_tot);
            //check_delete_and_fill( temp_vec2, score_single_pass, deleted_result);
            score_single_pass = check_score(deleted_result, temp_vec2);
            //print_vector(temp_vec2);
            //insert into animation table
            row_index++;
            animation_index_table.emplace(anima_payer, [&](auto &rowindex) {
               rowindex.index = row_index;
               rowindex.level = level;
               if (current_process.row_or_column)
               {
                  rowindex.orientation = 0;
               }
               else
               {
                  rowindex.orientation = 1;
               }
               rowindex.pos_num = current_process.number;
               std::memcpy(&rowindex.view[0], &temp_vec2[0], num);
               index = 0;
               for_each(temp_vec2_index.begin(), temp_vec2_index.end(), [&](uint16_t b) {
                rowindex.board_index[index]= b;
           index++; });
               //std::memcpy(&rowindex.board_index[0], &temp_vec2_index[0], num);
               int counter = 0;

               for_each(deleted_result.begin(), deleted_result.end(), [&](bool del) {
                  //print(std::to_string(del));
                  if (del)
                  {
                     rowindex.empty[counter] = '@';
                  }
                  counter++;
               });
            });
         }
         //copy vector to view
         /*print("index before merging into board is:");
        for_each(temp_vec2_index.begin(),temp_vec2_index.end(), [](uint16_t b){print(" ", std::to_string(b));});
        print("\n");*/
         index = 0;
         for_each(temp_vec2.begin(), temp_vec2.end(), [&](char b) {
           current_game.board[index*num + current_process.number - 1] = b;
           current_game.board_index[index*num + current_process.number - 1] = temp_vec2_index[index] ;
           index++; });
         //may refactor into function
         //std::memcpy(&view_col[0], &temp_vec2[0], num);
         //board[boost::indices[a_range] [current_process.number - 1]] = view_col;
         vector_queue.pop();
         print("queue processing 3\n ");
         //print_view(view_col);
      }

      //compare vectors
      print("queue processing 4\n ");
      //push changes rows or columns into queue
      int index = 0;
      int count = 0;
      compare_vec(temp_vec1, temp_vec2, compare_result);

      for_each(compare_result.begin(), compare_result.end(), [&](bool b) {
      if (b){
        count++;
        view_pos position;
        position.row_or_column = !current_process.row_or_column;
        position.number = index + 1;
        if (index < num){
        vector_queue.push(position);
        }
      }
      index++; });
      print("queue processing 6\n ");
      //process_vector_queue(vector_queue, board, score_tot);
      return;
      //process view below
   }
   else
   {

      return; //done
   }
}

/**
 * @brief Check if cell is empty
 * @param cell - value of the cell (should be either 0, 1, or 2)
 * @return true if cell is empty
 */
bool is_empty_cell(const uint8_t &cell)
{
   return cell == 0;
}

/**
 * @brief Check for valid movement
 * @detail Movement is considered valid if it is inside the board and done on empty cell
 * @param row - the row of movement made by the player
 * @param column - the column of movement made by the player
 * @param board - the board on which the movement is being made
 * @return true if movement is valid
 */
bool is_valid_movement(const uint16_t &cell_cicked1, const uint16_t &cell_cicked2)
{
   if (cell_cicked1 < 64)
   {
      if (cell_cicked2 < 64)
      {
         if (std::abs(cell_cicked1 - cell_cicked2) == 1 || std::abs(cell_cicked1 - cell_cicked2) == 8)
         {
            return true;
         }
      }
      //uint32_t movement_location = row * BlockCoined::game::board_width + column;
      //bool is_valid = movement_location < board.size() && is_empty_cell(board[movement_location]);
   }
   return false;
}
//boot strap tester
int BlockCoined::get_score(const name &host, const name &challenger, BlockCoined::block_jewel &current_game, const uint16_t &cell_cicked1, const uint16_t &cell_cicked2)
{
   animaindex animation_index_table(_self, host.value);
   auto itr_temp = animation_index_table.begin();
   while (itr_temp != animation_index_table.end())
   {
      itr_temp = animation_index_table.erase(itr_temp);
   }
   auto itr_anima = animation_index_table.begin();

   int score_tot1 = 0;
   BlockCoined::view_pos P1;
   BlockCoined::view_pos P2;
   BlockCoined::view_pos P3;

   if (abs(cell_cicked1 - cell_cicked2) > 1)
   {
      P1.row_or_column = true;
      P2.row_or_column = true;
      P3.row_or_column = false;
      P1.number = cell_cicked1 / this->num + 1;
      P2.number = cell_cicked2 / this->num + 1;
      P3.number = cell_cicked1 % this->num + 1;
      BlockCoined::view_queue.push(P3);
      BlockCoined::view_queue.push(P1);
      BlockCoined::view_queue.push(P2);
   }
   else
   {
      P1.row_or_column = true;
      P2.row_or_column = false;
      P3.row_or_column = false;
      P1.number = cell_cicked1 / this->num + 1;
      P2.number = cell_cicked1 % this->num + 1;
      P3.number = cell_cicked2 % this->num + 1;
      BlockCoined::view_queue.push(P1);
      BlockCoined::view_queue.push(P2);
      BlockCoined::view_queue.push(P3);
   }

   int anima_index_being_processed = 1; //first value gets pushed into animation table will have a value of index = index+1;
   while (!view_queue.empty())
   {

      print("in get score\n ");
      //transform(current_game.board);
      //print( "in transformed\n ");
      process_vector_queue(view_queue, current_game, score_tot1, animation_index_table, anima_index_being_processed, challenger);
      print("queue processed\n ");
      //inverse_transform(current_game.board);
      //print( "inverse_transform\n ");

      anima_index_being_processed++; //track index being processed b/c queue does not
   }

   return score_tot1;
}
/**
 * @brief Get winner of the game
 * @detail Winner of the game is the first player who made three consecutive aligned movement
 * @param current_game - the game which we want to determine the winner of
 * @return winner of the game (can be either none/ draw/ account name of host/ account name of challenger)
 */
name BlockCoined::get_winner(const BlockCoined::block_jewel &current_game, const name &host)
{
   name winner = "none"_n;
   if (current_game.Game_turn >= current_game.Queue_pos_max)
   {
      ticketlist existing_ticket_list(_self, host.value);

      block_jewel::chalindex chal_index_table(_self, host.value);
      int prev_score = 0;
      name prev_chal = "none"_n;
      for_each(chal_index_table.begin(), chal_index_table.end(), [&](auto &challenger) {
         if (challenger.score > prev_score)
         {
            winner = challenger.challenger;
         }
         prev_score = challenger.score;
         auto itr_ticket = existing_ticket_list.find(challenger.challenger.value); //for each challenger look up score and add score to current ticket holding
         bool no_tickets_yet = (itr_ticket == existing_ticket_list.end());
         eosio_assert(!(no_tickets_yet), "game error: missing challenger in ticket_list");
         existing_ticket_list.modify(itr_ticket, _self, [&](auto &entry) {
            entry.num_ticket += (current_game.Queue_pos_max - 1) * challenger.score / current_game.host_score; //will use num_ticket_available as holding
         }); });
   }
   // Draw if the board is full, otherwise the winner is not determined yet
   return winner;
}

/**
 * @brief Apply create action
 */
/*void BlockCoined::create(const name& challenger, const name& host) {
      print( "created jgames: \n ");
   //eosio::print("here");
   require_auth(host);
   //eosio_assert(challenger != host, "challenger shouldn't be the same as host");
   // Check if game already exists
   jgames existing_host_games( _self, _self.value ); //constructor
   //auto itr = existing_host_games.find( challenger.value );
   //eosio_assert(itr == existing_host_games.end(), "game already exists");

   existing_host_games.emplace(host, [&]( auto& g ) {
      g.host = host;
      g.turn = host;
   });
}  */

/**
 * @brief Apply create action
 */
void BlockCoined::createjgames(const name &host)
{
   print("created jgames: \n ");
   //eosio::print("here");
   require_auth(host);
   //eosio_assert(challenger != host, "challenger shouldn't be the same as host");
   // Check if game already exists
   jgames existing_host_games(_self, host.value); //constructor

   //auto itr = existing_host_games.find( challenger.value );
   //eosio_assert(itr == existing_host_games.end(), "game already exists");

   existing_host_games.emplace(host, [&](auto &g) {
      g.host = host;
      g.turn = host;

      block_jewel::chalindex chal_index_table(_self, host.value);
      auto itr_temp = chal_index_table.find(host.value);
      if (itr_temp == chal_index_table.end())
      {
         print("got here 8 \n");
         auto itr_index = chal_index_table.emplace(host, [&](auto &index) {
            index.score = 0;
            index.challenger = host;
         });
      }
      //test place host into first queue
      block_jewel::queue_table queue_index_table(_self, host.value);
      auto itr_temp2 = queue_index_table.find(1);
      if (itr_temp2 == queue_index_table.end())
      {
         auto itr_index2 = queue_index_table.emplace(host, [&](auto &index) {
            index.index = 1;
            index.challenger = host;
         });
      }
   });

   gamelist existing_game_list(_self, _self.value); // scope to the contract name
   existing_game_list.emplace(host, [&](auto &list) {
      list.host = host;
      list.tot_num_ticket = 0;
   });
}

void BlockCoined::joinhostgame(const name &host, const name &challenger)
{
   print("joining host_game: \n ");
   //print( "challenger name is: \n ");
   print("challenger name is: ", challenger);
   print("\n ");
   //eosio::print("here");
   //require_auth(challenger);

   eosio_assert(challenger != host, "challenger shouldn't be the same as host");
   // Check if game already exists

   jgames existing_host_games(_self, host.value); //constructor

   auto itr = existing_host_games.find(host.value);
   //auto itr = existing_host_games.find( challenger.value );
   //eosio_assert(itr == existing_host_games.end(), "game already exists");

   existing_host_games.modify(itr, itr->host, [&](auto &g) {
      print("got here 3 \n");
      block_jewel::chalindex chal_index_table(_self, host.value);
      auto itr_temp = chal_index_table.find(challenger.value);
      if (itr_temp == chal_index_table.end())
      {
         print("got here 7 \n");
         auto itr_index = chal_index_table.emplace(challenger, [&](auto &index) {
            index.score = 0;
            index.challenger = challenger;
         });
      }

      //g.challengers_vec.push_back(challenger_st);
   });
}

/**
 * @brief Apply restart action
 */
/*void BlockCoined::restart(const name &challenger, const name &host, const name &by)
{
   print("restarted \n ");
   require_auth(by);

   // Check if game exists
   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(challenger.value);
   eosio_assert(itr != existing_host_games.end(), "game doesn't exists");

   // Check if this game belongs to the action sender
   eosio_assert(by == itr->host, "this is not your game!");

   // Reset game
   existing_host_games.modify(itr, itr->host, [](auto &g) {
      g.reset_game();
   });
}*/

/**
 * @brief Apply close action
 */
void BlockCoined::close(const name &challenger, const name &host)
{
   print("closed \n ");
   require_auth(host);

   // Check if game exists
   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);
   print("Got here in close \n ");
   eosio_assert(itr != existing_host_games.end(), "game doesn't exists");
   existing_host_games.erase(itr);

   //auto it = existing_host_games.begin();
   //while (it != existing_host_games.end()) {
   //  it = existing_host_games.erase(it);
   //}

   block_jewel::chalindex chal_index_table(_self, host.value);
   auto itr1 = chal_index_table.begin();
   while (itr1 != chal_index_table.end())
   {
      itr1 = chal_index_table.erase(itr1);
   }
   //eosio_assert(itr1 != chal_index_table.end(), "challenger doesn't exists");
   animaindex animation_index_table(_self, host.value);
   auto itr_temp = animation_index_table.begin();
   while (itr_temp != animation_index_table.end())
   {
      itr_temp = animation_index_table.erase(itr_temp);
   }

   gamelist existing_game_list(_self, _self.value); // scope to the contract name
   auto itr_game_lst = existing_game_list.find(host.value);
   existing_game_list.erase(itr_game_lst);

   block_jewel::queue_table queue_index_table(_self, host.value);
   auto itr_temp2 = queue_index_table.begin();
   while (itr_temp2 != queue_index_table.end())
   {
      itr_temp2 = queue_index_table.erase(itr_temp2);
   }
   // Remove game
   //existing_host_games.erase(itr);
   //chal_index_table.erase(itr1);
   ticketlist existing_ticket_list(_self, host.value);
   auto itr_ticket = existing_ticket_list.begin();
   while (itr_ticket != existing_ticket_list.end())
   {
      int qty = itr_ticket->num_ticket - 1;
      asset amount(qty * 10000, eosio::symbol("BLC", 4));
      existing_ticket_list.modify(itr_ticket, _self, [&](auto &entry) { //move paid token to exchange for queues
         entry.num_ticket = 0;                                          //will use num_ticket_available as holding
      });

      print("account being refunded is: ", itr_ticket->challenger);
      if (qty > 0)
      {
         action(
             permission_level{get_self(), "active"_n},
             "blocointoken"_n,
             "transfer"_n,
             std::make_tuple(_self, itr_ticket->challenger, amount, std::string("test")))
             .send();
      }
      itr_ticket = existing_ticket_list.erase(itr_ticket);
   }
}

/**
 * @brief Apply move action
 */
void BlockCoined::move(const name &host, const name &by, const uint16_t &cell_cicked1, const uint16_t &cell_cicked2)
{
   print("move \n ");
   require_auth(by);
   // Check if game exists
   jgames existing_host_games(_self, host.value);
   const auto itr = existing_host_games.find(host.value);
   print("move first Queue_pos is: ", std::to_string(itr->Queue_pos));
   print("\n ");
   eosio_assert(itr != existing_host_games.end(), "game doesn't exists");
   // Check if game state is ready
   eosio_assert(check_set_game_state(host) == 1, "game is not ready to play");
   // Check if by is the current player on Queue
   name queued_name = get_player_from_queue(*itr, host);
   print("player queued name: ", queued_name);
   eosio_assert(by == queued_name, "it's not your turn yet!");
   // Check if this game hasn't ended yet
   eosio_assert(itr->winner == "none"_n, "the game has ended!");

   eosio_assert(is_valid_movement(cell_cicked1, cell_cicked2), "invalid move");
   // Check if this game belongs to the action sender
   //eosio_assert(by == itr->host, "this is not your game!");
   // Check if this is the  action sender's turn
   //eosio_assert(by == itr->turn, "it's not your turn yet!");
   existing_host_games.modify(itr, itr->host, [&](auto &g) {
      g.state = 2; //set game to run
   });

   if (itr->Game_turn < itr->Queue_pos_max)
   {
      //Run game
      existing_host_games.modify(itr, itr->host, [&](auto &g) {
         g.Game_turn++;
         g.turn = by; //set game to run
         g.block_num = tapos_block_num();
         print("g.Game_turn is: ", std::to_string(g.Game_turn));
         print("\n ");
         print("g.block_num is: ", std::to_string(g.block_num));
         print("\n ");
      });
      // Check if user makes a valid movement
      //eosio_assert(is_valid_movement(row, column, itr->board), "not a valid movement!");

      // Fill the cell, 1 for host, 2 for challenger
      // const uint8_t cell_value = itr->turn == itr->host ? 1 : 2;
      //const auto turn = itr->turn == itr->host ? itr->challenger : itr->host;

      char temp = 'A';
      int idx;
      int score = 0;

      existing_host_games.modify(itr, itr->host, [&](auto &g) {
         //swap colors
         temp = g.board[cell_cicked1];
         idx = g.board_index[cell_cicked1];
         g.board[cell_cicked1] = g.board[cell_cicked2];
         g.board_index[cell_cicked1] = g.board_index[cell_cicked2];
         g.board[cell_cicked2] = temp;
         g.board_index[cell_cicked2] = idx;
         //get_score send clicks, move and delete cells according to board rules, and returns score
         score = get_score(host, by, g, cell_cicked1, cell_cicked2);
         g.host_score = g.host_score + score;
         //g.Queue_pos = g.Queue_pos  + 1 ;
         print("g.Queue_pos is: ", std::to_string(g.Queue_pos));
         print("\n ");
         set_score(host, by, score);
         print("score is: ", std::to_string(g.host_score));
         print("\n ");
         pop_queue(host);

         //g.board[row * BlockCoined::game::board_width + column] = cell_value;
         //g.turn = turn;
         //g.winner = get_winner(g);
      });
   }
   // print("score is: ", std::to_string(g.host_score));
   if (itr->Game_turn == itr->Queue_pos_max)
   {
      print("game ended");
      if (itr->winner == "none"_n)
      {
         name winner = get_winner(*itr, host);
         print("winner is: ", winner);
         existing_host_games.modify(itr, itr->host, [&](auto &g) { g.winner = winner; });
      }
   }
}

//action
void BlockCoined::stealturn(const name &host, const name &by)
{
   print("exec stealturn");
   print("\n ");
   require_auth(by);
   block_jewel::chalindex chal_index_table(_self, host.value);
   auto itr_temp = chal_index_table.find(by.value);
   eosio_assert(itr_temp != chal_index_table.end(), "You are not in the game");
   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);
   eosio_assert(tapos_block_num() - itr->block_num >= itr->time_out_limit, "Not enough block passed from last move to steal yet");

   existing_host_games.modify(itr, itr->host, [&](auto &g) {
      block_jewel::queue_table queue_index_table(_self, host.value);
      auto q_itr = queue_index_table.begin();
      queue_index_table.modify(q_itr, by, [&](auto &q) { q.challenger = by; });
      g.turn = by;
   });
}

vector<bool> BlockCoined::mark_del(array_view &view_line, int board_width)
{
   //mark delete mark
   int k = 0;
   int scored = 0;
   vector<bool> mark_del(board_width, 0);

   for (i = 1; i < board_width - 1; i++)
   {
      if (view_line[i] == view_line[i - 1])
      {
         if (view_line[i] == view_line[i + 1])
         {
            scored++;
            mark_del[i] = 1;
            mark_del[i - 1] = 1;
            mark_del[i + 1] = 1;
            //cout << "found" << '\n';
            for (k = i + 2; k < board_width - 1; k++)
            {
               if (view_line[i] == view_line[k])
               {
                  scored++;
                  mark_del[k] = 1;
                  //cout << "found!" << '\n';
               }
               else
               {
                  break;
               }
            }
            if (scored > 1)
            {
               i = k;
            }
         }
      }
   }

   return mark_del;
}

void BlockCoined::transform(const vector<char> &board)
{
   int j;
   int k;
   for (int i = 0; i < board.size(); i++)
   {
      j = i % this->board_width;
      k = i / this->board_width;
      this->board[k][j] = board[i];
   }
}

void BlockCoined::inverse_transform(vector<char> &board)
{
   int j;
   int k;
   for (int i = 0; i < board.size(); i++)
   {
      j = i % this->board_width;
      k = i / this->board_width;
      board[i] = this->board[k][j];
   }
}

BlockCoined::array_view BlockCoined::get_view(bool row_or_col, int index)
{

   if (row_or_col)
   {
      range a_range = range().start(0).finish(this->board_width).stride(1);
      array_view view_row = this->board[boost::indices[index][a_range]];
      return view_row;
   }
   else
   {
      range a_range = range().start(0).finish(this->board_height).stride(1);
      array_view view_col = this->board[boost::indices[a_range][index]];
      return view_col;
   }
}

void BlockCoined::set_board_from_view(const BlockCoined::array_view view, bool row_or_col, int index)
{

   if (row_or_col)
   {
      range a_range = range().start(0).finish(this->board_width).stride(1);
      this->board[boost::indices[index][a_range]] = view;
   }
   else
   {
      range a_range = range().start(0).finish(this->board_height).stride(1);
      this->board[boost::indices[a_range][index]] = view;
   }
}

name BlockCoined::get_player_from_queue(const block_jewel &current_game, const name &host)
{
   block_jewel::queue_table queue_index_table(_self, host.value);
   auto itr = queue_index_table.begin();
   print("get_player_from_queue is: ", std::to_string(current_game.Queue_pos));
   print("\n ");
   print("get_player_from_queue 2 is: ", std::to_string(itr->index));
   print("\n ");
   //if (current_game.Queue_pos == itr->index){
   return (itr->challenger);
   //}else{return("none"_n);}
}

int BlockCoined::check_set_game_state(const name &host)
{
   int new_game_state = 0;
   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);
   if (is_queue_empty(host))
   {
      new_game_state = 0;
   }
   else
   {
      new_game_state = 1;
   }
   //set current game state
   existing_host_games.modify(itr, itr->host, [&](auto &g) {
      g.state = new_game_state;
   });
   return new_game_state;
}

bool BlockCoined::is_queue_empty(const name &host)
{
   block_jewel::queue_table queue_index_table(_self, host.value);
   auto begin_itr = queue_index_table.begin();
   auto end_itr = queue_index_table.end();
   if (begin_itr == end_itr)
   {
      return true;
   }
   else
   {
      return false;
   }
}

void BlockCoined::set_score(const name &host, const name &by, unsigned int score)
{
   block_jewel::chalindex chal_index_table(_self, host.value);
   auto itr_temp = chal_index_table.find(by.value);
   if (itr_temp != chal_index_table.end())
   {
      chal_index_table.modify(itr_temp, itr_temp->challenger, [&](auto &index) {
         index.score = index.score + score;
      });
   }
}

void BlockCoined::enqueue(const name &host, const name &buyer)
{
   print("in enqueue ");
   print("\n ");
   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);
   existing_host_games.modify(itr, host, [&](auto &g) {
      g.Queue_pos = g.Queue_pos + 1;
   });

   block_jewel::queue_table queue_index_table(_self, host.value);
   auto end_itr = queue_index_table.end();
   auto begin_itr = queue_index_table.begin();

   queue_index_table.emplace(buyer, [&](auto &index) {
      int temp_index;

      index.index = itr->Queue_pos;
      index.challenger = buyer;
   });
}

void BlockCoined::pop_queue(const name &host)
{
   print("in pop_queue ");
   print("\n ");
   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);
   existing_host_games.modify(itr, itr->host, [&](auto &g) {
      block_jewel::queue_table queue_index_table(_self, host.value);
      auto begin_itr = queue_index_table.begin();
      //begin_itr++;
      //check top of the table is synced with queue
      print("in pop, begin index is: ", std::to_string(begin_itr->challenger.value));
      print("g.turn is: ", std::to_string(g.turn.value));
      //if(g.turn == begin_itr->challenger ){
      queue_index_table.erase(begin_itr);
      //}
      g.turn = "none"_n;
   });
}

void BlockCoined::transfer_action(const name buyer, const name reciever, const asset quantity, const string memo)
{
   if (buyer == _self)
      return;
   name host = eosio::name(memo);
   asset amount(1, eosio::symbol("BLC", 4));
   eosio_assert(quantity.symbol == amount.symbol, "please send BLC token to play");
   int quant = quantity.amount / 10000; //unit is int 1000s regardless of decimal place
   require_auth(buyer);
   print("host name is ", host);
   block_jewel::chalindex chal_index_table(_self, host.value);
   auto itr_temp = chal_index_table.find(buyer.value);
   //print( "in buy queue itr is, ", std::to_string(itr_temp));
   eosio_assert(itr_temp != chal_index_table.end(), "please join game first");
   //print( "in buy queue itr2 is, ", std::to_string(chal_index_table.end()));
   print("\n ");
   //By pass this since assert was forced
   if (itr_temp == chal_index_table.end())
   {
      print("join game called");
      print("\n ");
      joinhostgame(host, buyer);
   }

   //after allocated payment to this contract

   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);

   print("in buy queue, Queue_pos_max is ", std::to_string(itr->Queue_pos_max));
   print("in buy queue, Queue_pos is ", std::to_string(itr->Queue_pos));
   print("in buy queue, quant is  ", std::to_string(quant));
   print("\n ");
   eosio_assert(itr->Queue_pos_max - itr->Queue_pos >= quant, "Queue full for this game");

   //insert into ticket take. Having tickets will allow players to buy Queues
   ticketlist existing_ticket_list(_self, host.value);
   auto itr_ticket = existing_ticket_list.find(buyer.value);
   bool no_tickets_yet = (itr_ticket == existing_ticket_list.end());
   if (no_tickets_yet)
   {                                                         //contract pays
      existing_ticket_list.emplace(_self, [&](auto &entry) { //add new row to table
         entry.challenger = buyer;
         entry.num_ticket = quant;
      });
   }
   else
   {
      existing_ticket_list.modify(itr_ticket, _self, [&](auto &entry) { //move paid token to exchange for queues
         entry.num_ticket = entry.num_ticket + quant;                   //top off existring number of queue tickets
      });                                                               //contract pays
                                                                        //check_set_game_state(host);
   }                                                                    //test function for transfer action listener
}
//action
//action: need challenger to spend RAM on adding queues (rows) to table
//buy queues with ticket user initiate this action
void BlockCoined::buyqueue(const name &host, const name &challenger, const uint16_t &quantity)
{
   require_auth(challenger);
   uint16_t num_ticket_available = 0;
   uint16_t quant = quantity;

   jgames existing_host_games(_self, host.value);
   auto itr = existing_host_games.find(host.value);
   eosio_assert(itr->Queue_pos_max - itr->Queue_pos >= quantity, "Queue full for this game");

   //update game list to show how many tickets are in the pot
   gamelist existing_game_list(_self, _self.value);
   auto itr_game_lst = existing_game_list.find(host.value);
   existing_game_list.modify(itr_game_lst, challenger, [&](auto &list) { list.tot_num_ticket += quantity; });

   //look up challenger and return how many tokens is left in game
   ticketlist existing_ticket_list(_self, host.value);
   auto itr_ticket = existing_ticket_list.find(challenger.value);
   bool no_tickets_yet = (itr_ticket == existing_ticket_list.end());

   eosio_assert(!(no_tickets_yet), "please buy send token into current game first");
   eosio_assert(itr_ticket->num_ticket >= quantity, "Not enough tickets available");

   num_ticket_available = itr_ticket->num_ticket;
   existing_ticket_list.modify(itr_ticket, _self, [&](auto &entry) { //move paid token to exchange for queues
      entry.num_ticket = entry.num_ticket - quantity;                //will use num_ticket_available as holding
   });

   while (quant > 0)
   {
      print("in while loop: ", std::to_string(quant));
      print("\n ");
      enqueue(host, challenger);
      quant--;
   }
}

//action
void BlockCoined::refundtoken(const name host, const name challenger)
{
   //transfer available tickets from ticketlist back into token form
   //INLINE_ACTION token transfer
   uint16_t qty;
   std::string quantity = "25.0000 BLC";

   ticketlist existing_ticket_list(_self, host.value);
   auto itr_ticket = existing_ticket_list.find(challenger.value);
   bool no_tickets_yet = (itr_ticket == existing_ticket_list.end());
   eosio_assert(!(no_tickets_yet), "nothing to refund");
   qty = itr_ticket->num_ticket - 1;

   asset amount(qty * 10000, eosio::symbol("BLC", 4));
   existing_ticket_list.modify(itr_ticket, _self, [&](auto &entry) { //move paid token to exchange for queues
      entry.num_ticket = 0;                                          //will use num_ticket_available as holding
   });
   existing_ticket_list.erase(itr_ticket);
   print("got here before refunding");
   print("receiver should be :", challenger.value);
   print("blockcoined is :", name("blockcoined").value);
   action(
       permission_level{get_self(), "active"_n},
       "blocointoken"_n,
       "transfer"_n,
       std::make_tuple(_self, challenger, amount, std::string("test")))
       .send();
}

extern "C" void apply(uint64_t receiver, uint64_t code, uint64_t action)
{
   auto self = receiver;
   if (action == name("transfer").value && code == name("blocointoken").value)
   {
      print("apply executed");
      print("receiver is :", receiver);
      print("blockcoined is :", name("blockcoined").value);
      eosio_assert(code == "blocointoken"_n.value, "Must transfer BLC");
      execute_action<BlockCoined>(eosio::name(receiver), eosio::name(code),
                                  &BlockCoined::transfer_action);
   }
   else if (code == receiver)
   {
      switch (action)
      {
         EOSIO_DISPATCH_HELPER(BlockCoined, (close)(move)(createjgames)(joinhostgame)(buyqueue)(stealturn)(refundtoken));
      }
   }
}
//EOSIO_DISPATCH( BlockCoined, (create)(restart)(close)(move)(createjgames)(joinhostgame)(buyqueue)(stealturn))
