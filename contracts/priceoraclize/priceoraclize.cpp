#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include <eosiolib/time.hpp>
#include <eosiolib/system.h>

using namespace eosio;
using std::string;

template <uint64_t OraclizeName, uint32_t BestBeforeOffset, uint32_t UpdateOffset, typename T>
class oraclized
{
  struct data
  {
    uint32_t best_before;
    uint32_t update_after;
    T value;

    EOSLIB_SERIALIZE(data, (best_before)(update_after)(value))
  };

  constexpr static uint64_t pk_value = OraclizeName;
  struct row
  {
    data value;

    uint64_t primary_key() const { return pk_value; }

    EOSLIB_SERIALIZE(row, (value))
  };

  typedef eosio::multi_index<OraclizeName, row> table;

private:
  table _t;

public:
  oraclized(account_name code, scope_name scope) : _t(code, scope) {}

  bool exists()
  {
    return _t.find(pk_value) != _t.end();
  }

  bool fresh()
  {
    return exists() && get().best_before > now();
  }

  T value()
  {
    return get().value;
  }

  data get()
  {
    auto itr = _t.find(pk_value);
    eosio_assert(itr != _t.end(), "singleton does not exist");
    return itr->value;
  }

  data get_or_default(const T &def = T())
  {
    auto itr = _t.find(pk_value);
    return itr != _t.end() ? itr->value : def;
  }

  data get_or_create(account_name bill_to_account, const T &def = T())
  {
    auto itr = _t.find(pk_value);
    return itr != _t.end() ? itr->value
                           : _t.emplace(bill_to_account, [&](row &r) { r.value = data{}; });
  }

  void set(const T &value, account_name bill_to_account)
  {
    auto itr = _t.find(pk_value);
    if (itr != _t.end())
    {
      _t.modify(itr, bill_to_account, [&](row &r) { r.value = data{now() + BestBeforeOffset, now() + UpdateOffset, value}; });
    }
    else
    {
      _t.emplace(bill_to_account, [&](row &r) { r.value = data{now() + BestBeforeOffset, now() + UpdateOffset, value}; });
    }
  }

  void remove()
  {
    auto itr = _t.find(pk_value);
    if (itr != _t.end())
    {
      _t.erase(itr);
    }
  }
};

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

  // setup method 1
  void setup(account_name administrator, account_name master, account_name registry)
  {
    require_auth(_self);
    oraclize_master(_self, _self).set(master, _self);
    ask_data(administrator, registry, "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5", string());
    ask_data(administrator, registry, "36f7c5776d9de47314b73961dbc5afe691e66817b2eae3c1260feefbab131347", string());
  }

  void ask_data(account_name administrator, account_name registry, string data, string memo)
  {
    action(permission_level{administrator, N(active)},
           registry, N(ask),
           std::make_tuple(administrator, _self, data, memo))
        .send();
  }

  void pushprice(account_name oracle, string data_id, string memo, price data)
  {
    require_auth(oracle);

    if (strcmp(data_id.c_str(), "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5") == 0)
    {
      ethbtc.set(data, _self);
    }
    if (strcmp(data_id.c_str(), "36f7c5776d9de47314b73961dbc5afe691e66817b2eae3c1260feefbab131347") == 0)
    {
      eoseth.set(data, _self);
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