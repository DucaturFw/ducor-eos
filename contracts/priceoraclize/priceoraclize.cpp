#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include "oraclized.hpp"
#include "priceoraclize.hpp"

using namespace eosio;

typedef oraclized<N(btcusd), 86400, 3600, uint64_t> btcusd_data;
typedef oraclized<N(eosusd), 86400, 3600, uint64_t> eosusd_data;
typedef oraclized<N(latest.hash), 86400, 3600, std::string> latest_hash_data;

typedef singleton<N(master), account_name> oraclize_master;

class priceoraclize : public eosio::contract
{
private:
  btcusd_data btcusd;
  eosusd_data eosusd;
  latest_hash_data latest_hash;

  account_name master;

public:
  using contract::contract;

  priceoraclize(account_name s) : contract(s), btcusd(_self, _self), eosusd(_self, _self), latest_hash(_self, _self)
  {
    master = oraclize_master(_self, _self).get_or_create(_self, N(undefined));
  }

  // @abi action
  void setup(account_name master)
  {
    eosio::print("\n");
    printn(_self);
    require_auth(_self);
    oraclize_master(_self, _self).set(master, _self);
  }

  // @abi action
  void sell(account_name buyer, uint64_t amount)
  {
    eosio_assert(btcusd.fresh(), "btcusd data is out dated.");
    eosio_assert(eosusd.fresh(), "eosusd data is out dated.");
    eosio::print("\n");
    eosio::print("\n btc: ", amount * btcusd.value());
    eosio::print("\n eos: ", amount * eosusd.value());
  }

  // @abi action
  void pushuint(account_name oracle, std::string data_id, uint64_t data)
  {
    if (strcmp(data_id.c_str(), "0x100") == 0)
    {
      btcusd.set(data, oracle);
    }

    if (strcmp(data_id.c_str(), "0x101") == 0)
    {
      eosusd.set(data, oracle);
    }
  }

  // @abi action
  void pushstr(account_name oracle, std::string data_id, std::string data)
  {
    if (strcmp(data_id.c_str(), "0x102") == 0)
    {
      latest_hash.set(data, oracle);
    }
  }
};

EOSIO_ABI(priceoraclize, (sell)(setup)(pushuint)(pushstr))
