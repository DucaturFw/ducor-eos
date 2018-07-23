#include <eosiolib/eosio.hpp>
#include "hello.hpp"

using namespace eosio;

class hello : public eosio::contract {
  public:
      using contract::contract;

      /// @abi action 
      void exec() {
         print("Output from hello");
      }
};

EOSIO_ABI( hello, (exec) )
