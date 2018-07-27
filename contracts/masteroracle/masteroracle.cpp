#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/time.hpp>
#include <eosiolib/crypto.h>
#include <eosiolib/print.h>
#include "masteroracle.hpp"

using namespace eosio;

namespace ducatur
{
// @abi table hash i64
struct requestHash
{
  account_name contract;
  std::string task;

  checksum256 get_hash()
  {
    checksum256 result;
    size_t tasklen = strlen(task.c_str());
    char *buffer = (char *)malloc(tasklen + 8);
    memcpy(buffer, &contract, 8);
    memcpy(buffer + 8, task.data(), tasklen);
    sha256(buffer, tasklen + 8, &result);
    return result;
  }
};

// @abi table request i64
struct request
{
  std::string task;
  account_name contract;
  uint32_t timestamp;
  bool active;

  uint64_t primary_key() const
  {
    return get_hash(task, contract);
  }

  static uint64_t get_hash(std::string task, uint64_t contract)
  {
    requestHash rh{contract, task};
    return pack_hash(rh.get_hash());
  }

  static uint64_t pack_hash(checksum256 hash)
  {
    const uint64_t *p64 = reinterpret_cast<const uint64_t *>(&hash);
    return p64[0] ^ p64[1] ^ p64[2] ^ p64[3];
  }

  EOSLIB_SERIALIZE(request, (task)(contract)(timestamp)(active))
};

typedef multi_index<N(request), request> request_table;

class masteroracle : public eosio::contract
{
public:
  using contract::contract;

  request_table requests;
  account_name token;

  masteroracle(account_name s) : contract(s), requests(_self, _self), token(N(ducaturtoken)) {}

  // @abi action
  void ask(account_name administrator, account_name contract, std::string task)
  {
    require_auth(administrator);
    auto itt = requests.find(request::get_hash(task, contract));
    eosio_assert(itt == requests.end(), "Already known request");
    requests.emplace(administrator, [&](request &r) {
      r.task = task;
      r.contract = contract;
      r.timestamp = now();
      r.active = true;
    });
  }

  // @abi action
  void stop(account_name administrator, account_name contract, std::string task)
  {
    require_auth(administrator);
    uint64_t id = request::get_hash(task, contract);
    auto itt = requests.find(id);
    eosio_assert(itt != requests.end(), "Unknown request");
    eosio_assert(itt->active, "Non-active request");

    requests.modify(itt, administrator, [&](request &r) {
      r.active = false;
    });
  }

  // @abi action
  void start(account_name administrator, account_name contract, std::string task)
  {
    require_auth(administrator);
    uint64_t id = request::get_hash(task, contract);
    auto itt = requests.find(id);
    eosio_assert(itt != requests.end(), "Unknown request");
    eosio_assert(!(itt->active), "Active request");

    requests.modify(itt, administrator, [&](request &r) {
      r.active = true;
    });
  }
};

EOSIO_ABI(masteroracle, (ask)(stop)(start))
} // namespace ducatur
