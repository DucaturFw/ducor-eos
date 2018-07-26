#include <string>
#include <eosiolib/eosio.hpp>
#include <eosiolib/time.hpp>
#include <eosiolib/crypto.h>
#include <eosiolib/print.h>
#include "masteroracle.hpp"

using namespace eosio;

namespace ducatur
{
constexpr char hexmap[] = {'0', '1', '2', '3', '4', '5', '6', '7',
                           '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};

std::string hexStr(const char *data, int len)
{
  std::string s(len * 2, ' ');
  for (int i = 0; i < len; ++i)
  {
    s[2 * i] = hexmap[(data[i] & 0xF0) >> 4];
    s[2 * i + 1] = hexmap[data[i] & 0x0F];
  }
  return s;
}

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

  uint64_t primary_key()
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

  EOSLIB_SERIALIZE(request, (task)(contract)(timestamp))
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
  void ask(account_name contract, std::string task)
  {
    auto itt = requests.find(request::get_hash(task, contract));
    eosio_assert(itt == requests.end(), "Already known request");
    requests.emplace(contract, [&](request &r) {
      r.task = task;
      r.contract = contract;
      r.timestamp = now();
    });
  }
};

EOSIO_ABI(masteroracle, (ask))
} // namespace ducatur