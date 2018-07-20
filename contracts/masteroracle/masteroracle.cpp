#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/crypto.h>
#include "masteroracle.hpp"

using namespace eosio;

namespace ducatur
{

// @abi table request i64
struct request
{
  std::string task;
  account_name contract;

  uint64_t primary_key()
  {
    return get_hash();
  }
  
  uint64_t get_hash()
  {
    checksum256 result;
    sha256((char *)this, sizeof(this), &result);
    const uint64_t *p64 = reinterpret_cast<const uint64_t *>(&result);

    return p64[0] ^ p64[1] ^ p64[2] ^ p64[3];
  }

  EOSLIB_SERIALIZE(request, (task)(contract))
};

typedef multi_index<N(request), request> request_table;

class masteroracle : public eosio::contract
{
public:
  using contract::contract;
  request_table requests;

  masteroracle(account_name s) : contract(s), requests(_self, _self) {}

  // @abi action
  void exec(account_name contract, std::string task)
  {
    require_auth(contract);

    request found{
      task,
      contract
    };

    auto itt = requests.find(found.get_hash());
    eosio_assert(itt == requests.end(), "Already known request");

    requests.emplace(contract, [&](request &r) {
      r.task = task;
      r.contract = contract;
    });
  }
};

EOSIO_ABI(masteroracle, (exec))
}