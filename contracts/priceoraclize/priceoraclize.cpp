#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include "oraclized.hpp"

using namespace eosio;

struct price
{
  uint64_t value;
  uint8_t decimals;

  EOSLIB_SERIALIZE(price, (value)(decimals))
};

typedef oraclized<N(ethbtc), 84600, 3600, price> ethbtc_data;
typedef oraclized<N(eoseth), 84600, 3600, price> eoseth_data;
typedef singleton<N(master), account_name> oraclize_master;

class YOUR_CONTRACT_NAME : public eosio::contract
{
private:
  ethbtc_data ethbtc;
  eoseth_data eoseth;

  account_name master;

public:
  using contract::contract;

  YOUR_CONTRACT_NAME(account_name s) : contract(s), ethbtc(_self, _self), eoseth(_self, _self)
  {
    master = oraclize_master(_self, _self).get_or_create(_self, N(undefined));
  }

  void setup(account_name administrator, account_name master, account_name registry)
  {
    require_auth(_self);
    oraclize_master(_self, _self).set(master, _self);
    ask_data(administrator, registry, "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5");
    ask_data(administrator, registry, "36f7c5776d9de47314b73961dbc5afe691e66817b2eae3c1260feefbab131347");
  }

  void ask_data(account_name administrator, account_name registry, std::string data)
  {
    action(permission_level{administrator, N(active)},
           registry, N(ask),
           std::make_tuple(administrator, _self, data))
        .send();
  }

  void pushprice(account_name oracle, std::string data_id, price data)
  {
    require_auth(oracle);

    if (strcmp(data_id.c_str(), "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5") == 0)
    {
      ethbtc.set(data, oracle);
    }
    if (strcmp(data_id.c_str(), "36f7c5776d9de47314b73961dbc5afe691e66817b2eae3c1260feefbab131347") == 0)
    {
      eoseth.set(data, oracle);
    }
  }

  // @abi action
  void sell(account_name buyer, uint64_t amount)
  {
    eosio_assert(ethbtc.fresh(), "btcusd data is out dated.");
    eosio_assert(eoseth.fresh(), "btcptice data is out dated.");
    eosio::print("\n");
    eosio::print("\n eth: ", amount * ethbtc.value().value);
    eosio::print("\n eos: ", amount * eoseth.value().value);
  }
};

EOSIO_ABI(YOUR_CONTRACT_NAME, (sell)(setup)(pushprice))