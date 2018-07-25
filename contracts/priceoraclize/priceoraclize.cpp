#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include <eosiolib/time.hpp>
#include "priceoraclize.hpp"

using namespace eosio;

struct pricedata
{
  uint32_t best_before;
  uint32_t update_after;
  uint64_t price;
  uint8_t decimals;

  EOSLIB_SERIALIZE(pricedata, (best_before)(update_after)(price)(decimals))
};

typedef singleton<N(btcusd), pricedata> price_btcusd;

class priceoraclize : public eosio::contract
{
private:
  pricedata btcusd;

  void price_assert(pricedata price)
  {
    eosio_assert(price.best_before > now(), "data is outdated");
  }

  uint64_t pow(uint64_t a, uint8_t b)
  {
    uint64_t r = 1;
    while (b > 0)
    {
      r = r * a;
      b--;
    }

    return r;
  }

public:
  using contract::contract;

  priceoraclize(account_name s) : contract(s)
  {
    btcusd = price_btcusd(_self, _self).get_or_create(_self);
  }

  // @abi action
  void sell(account_name buyer, uint64_t amount)
  {
    price_assert(btcusd);

    eosio::print("\n cost: ", btcusd.price);
    eosio::print("\n price: ", amount * btcusd.price / pow(10, btcusd.decimals));
  }

  // @abi action
  void oraclized(account_name oracle, checksum256 data_id, uint64_t price, uint8_t decimals)
  {
    price_btcusd(_self, _self).set(pricedata{now() + 60 * 60 * 24, // 24 hours
                                             now() + 60 * 5,       // 5 minutes
                                             price, decimals},
                                   oracle);
  }
};

EOSIO_ABI(priceoraclize, (oraclized)(sell))
