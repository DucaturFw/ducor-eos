#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>
#include "priceoraclize.hpp"

using namespace eosio;

struct configuration
{
  account_name master_contract;

  EOSLIB_SERIALIZE(configuration, (master_contract))
};

typedef singleton<N(oracleconfig), configuration> config;

class priceoraclize : public eosio::contract
{
private:
  account_name m_master_contract;
  configuration m_config;

  void expose_fields()
  {
    m_master_contract = m_config.master_contract;
  }

public:
  using contract::contract;

  priceoraclize(account_name s) : contract(s)
  {
    m_config = config(_self, _self).get_or_create(_self, {N(null)});
    expose_fields();
  }

  void setup(configuration cfg)
  {
    require_auth(_self);
    config(_self, _self).set(cfg, _self);
    m_config = cfg;
    expose_fields();
  }

  /// @abi action
  void oraclized(uint64_t one, uint64_t two)
  {
    print("\none: ", one);
    print("\ntwo: ", two);
  }
};

EOSIO_ABI(priceoraclize, (oraclized))
