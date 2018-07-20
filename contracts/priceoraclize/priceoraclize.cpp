#include <eosiolib/eosio.hpp>
#include "priceoraclize.hpp"

using namespace eosio;

class priceoraclize : public eosio::contract {
  public:
      using contract::contract;

      /// @abi action 
      void exec() {
         print("Output from priceoraclize");
      }
};

EOSIO_ABI( priceoraclize, (exec) )
