#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include "oraclized.hpp"

using namespace eosio;

struct price
{
  uint64_t value;
  uint64_t decimals;

  EOSLIB_SERIALIZE(price, (value)(decimals))
};

typedef oraclized<N(btcusd), 84600, 3600, uint64_t> btcusd_data;
typedef oraclized<N(btcprice), 84600, 3600, price> btcprice_data;
typedef oraclized<N(eosusd), 84600, 3600, uint64_t> eosusd_data;
typedef oraclized<N(latest.hash), 600, 60, std::string> latest_hash_data;
typedef singleton<N(master), account_name> oraclize_master;

class YOUR_CONTRACT_NAME : public eosio::contract
{
private:
  btcusd_data btcusd;
  btcprice_data btcprice;
  eosusd_data eosusd;
  latest_hash_data latest_hash;

  account_name master;

public:
  using contract::contract;

  YOUR_CONTRACT_NAME(account_name s) : contract(s),
                                       btcusd(_self, _self),
                                       btcprice(_self, _self),
                                       eosusd(_self, _self),
                                       latest_hash(_self, _self)
  {
    master = oraclize_master(_self, _self).get_or_create(_self, N(undefined));
  }

  void setup(account_name administrator, account_name master, account_name registry)
  {
    require_auth(_self);
    oraclize_master(_self, _self).set(master, _self);
    ask_data(administrator, registry, "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874");
    ask_data(administrator, registry, "0x43f298fa9ef0590967e26fd3d183de6c13475ab810b287ea643a94ce75806eb9");
    ask_data(administrator, registry, "0xd65485674abcd1e477aa423556787039cec0c41fe373423c44feff042997f8ae");
    ask_data(administrator, registry, "0xfa6bfea31ea21819ca2de9f530fcc2ebc80d0a1b6130c600f5c3c085a335fdec");
  }

  void ask_data(account_name administrator, account_name registry, std::string data)
  {
    action(permission_level{administrator, N(active)},
           registry, N(ask),
           std::make_tuple(administrator, _self, data))
        .send();
  }

  void pushuint(account_name oracle, std::string data_id, uint64_t data)
  {
    require_auth(oracle);

    if (strcmp(data_id.c_str(), "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874") == 0)
    {
      eosio::print("\n");
      eosio::print("\n new btc value: ", data);
      btcusd.set(data, oracle);
      eosio::print("\n before: ", btcusd.get().best_before);
      eosio::print("\n now: ", now());
    }
    if (strcmp(data_id.c_str(), "0x43f298fa9ef0590967e26fd3d183de6c13475ab810b287ea643a94ce75806eb9") == 0)
    {
      eosio::print("\n");
      eosio::print("\n new eos value: ", data);
      eosusd.set(data, oracle);
    }
  }

  void pushstr(account_name oracle, std::string data_id, std::string data)
  {
    require_auth(oracle);

    if (strcmp(data_id.c_str(), "0xd65485674abcd1e477aa423556787039cec0c41fe373423c44feff042997f8ae") == 0)
    {
      latest_hash.set(data, oracle);
    }
  }

  void pushprice(account_name oracle, std::string data_id, price data)
  {
    require_auth(oracle);

    if (strcmp(data_id.c_str(), "0xfa6bfea31ea21819ca2de9f530fcc2ebc80d0a1b6130c600f5c3c085a335fdec") == 0)
    {
      btcprice.set(data, oracle);
    }
  }

  // @abi action
  void sell(account_name buyer, uint64_t amount)
  {
    eosio_assert(btcusd.fresh(), "btcusd data is out dated.");
    eosio_assert(btcprice.fresh(), "btcptice data is out dated.");
    eosio_assert(eosusd.fresh(), "eosusd data is out dated.");
    eosio::print("\n");
    eosio::print("\n btc: ", amount * btcusd.value());
    eosio::print("\n eos: ", amount * eosusd.value());
    eosio::print("\n btc struct: ");
    eosio::print("\n      value: ", btcprice.value().value);
    eosio::print("\n   decimals: ", btcprice.value().decimals);
  }
};

EOSIO_ABI(YOUR_CONTRACT_NAME, (sell)(setup)(pushuint)(pushstr)(pushprice))