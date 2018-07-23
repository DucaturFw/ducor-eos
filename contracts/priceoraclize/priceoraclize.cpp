#include <eosiolib/eosio.hpp>
#include "priceoraclize.hpp"

using namespace eosio;

class priceoraclize : public eosio::contract
{
public:
  using contract::contract;

  /// @abi action
  void oraclized(checksum256 hash, std::string data)
  {
    print(data);
  }
};

EOSIO_ABI(priceoraclize, (oraclized))
