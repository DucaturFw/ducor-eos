#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/action.hpp>
#include <eosiolib/singleton.hpp>
#include <eosiolib/time.hpp>
#include <eosiolib/system.h>

using namespace eosio;
using std::string;

struct push_data
{
  account_name oracle;
  account_name contract;
  string task;
  string memo;
  bytes data;

  EOSLIB_SERIALIZE(push_data, (oracle)(contract)(task)(memo)(data))
};

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

  bool require_update()
  {
    return exists() && get().update_after < now();
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

typedef oraclized<N(nulsbnb), 84600, 3600, price> nulsbnb_data;
typedef singleton<N(master), account_name> account_master;

class priceoraclized : public eosio::contract
{
private:
  nulsbnb_data nulsbnb;
  account_name known_master;

public:
  using contract::contract;

  priceoraclized(account_name s) : contract(s), nulsbnb(_self, _self)
  {
    known_master = account_master(_self, _self).get_or_create(_self, N(undefined));
  }

  void receive(account_name self, account_name code)
  {
    eosio_assert(code == known_master, "Unkown master contract");
    auto payload = unpack_action_data<push_data>();

    if (strcmp(payload.task.c_str(), "0xae1cb3a8b6b4c49c65d22655c1ec4d28a4b3819065dd6aaf990d18e7ede951f1") == 0)
    {
      price p = unpack<price>(payload.data);
      nulsbnb.set(p, _self);
      eosio::print("Receive NULS/BNB price: \n");
      eosio::print("\n  value: ", p.value);
      eosio::print("\n  decimals: ", uint64_t(p.decimals));
      return;
    }

    eosio_assert(true, "Unknown task received");
  }

  void ask_data(account_name administrator,
                account_name registry,
                string data,
                string memo,
                bytes args)
  {
    action(permission_level{administrator, N(active)},
           registry, N(ask),
           std::make_tuple(administrator, _self, data, 3600u, memo, args))
        .send();
  }

  // @abi action
  void setup(account_name administrator, account_name master)
  {
    require_auth(_self);
    account_master(_self, _self).set(master, _self);
    ask_data(administrator,
             master,
             "0xae1cb3a8b6b4c49c65d22655c1ec4d28a4b3819065dd6aaf990d18e7ede951f1",
             string(),
             bytes());
  }

  // @abi action
  void interact(uint64_t amount)
  {
    eosio_assert(nulsbnb.exists(), "nulsbnb data didn't pushed yet");
    eosio_assert(nulsbnb.fresh(), "nulsbnb data has been outdated");

    // get newest oraclized price
    price current_nulsbnb = nulsbnb.value();
    eosio_assert(current_nulsbnb.value <= 4100000, "Oraclized price lower than predefined 0.041 BTC per ETH threshold");
    eosio_assert(current_nulsbnb.decimals == 8, "Unexpected oraclized price tolerance");
    if (nulsbnb.require_update())
    {
      eosio::print("Oraclized data is fresh enough, but awaiting for coming update");
    }

    auto oraclize_record = nulsbnb.get();

    // same as nulsbnb.fresh()
    eosio_assert(oraclize_record.best_before <= now(), "nulsbnb data has been outdated");
    // same as nulsbnb.require_update()
    if (oraclize_record.update_after <= now())
    {
      eosio::print("Oraclized data is fresh enough, but awaiting for coming update");
    }

    eosio::print("\n ETH/BTC price is: ", current_nulsbnb.value);
  }
};

extern "C" void apply(uint64_t receiver, uint64_t code, uint64_t action)
{
  uint64_t self = receiver;
  if (action == N(onerror))
  {
    /* onerror is only valid if it is for the "eosio" code account and authorized by "eosio"'s "active permission */
    eosio_assert(code == N(eosio), "onerror action's are only valid from the \"eosio\" system account");
  }

  priceoraclized thiscontract(self);

  if (code == self || action == N(onerror))
  {
    switch (action)
    {
      EOSIO_API(priceoraclized, (setup)(interact))
    }
  }

  if (code != N(self) && action == N(push))
  {
    thiscontract.receive(receiver, code);
  }
}
