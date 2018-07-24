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
    eosio::print("\n contract: ", contract);
    eosio::print((std::string("\n") + hexStr(buffer, tasklen + 8)).c_str());
    eosio::print((std::string("\n") + hexStr((const char *)&result.hash[0], 32)).c_str());
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

struct ask_payload
{
  account_name contract;
  std::string task;

  EOSLIB_SERIALIZE(ask_payload, (contract)(task))
};

struct push_payload
{
  account_name sender;
  checksum256 hash;
  std::string data;

  EOSLIB_SERIALIZE(push_payload, (sender)(hash)(data))
};

typedef multi_index<N(request), request>
    request_table;

class masteroracle : public eosio::contract
{
public:
  using contract::contract;

  request_table requests;
  account_name token;

  masteroracle(account_name s) : contract(s), requests(_self, _self), token(N(ducaturtoken)) {}

  // @abi action
  void ask(ask_payload ask)

  {
    account_name contract = ask.contract;
    std::string task = ask.task;

    require_auth(contract);
    auto itt = requests.find(request::get_hash(task, contract));
    eosio_assert(itt == requests.end(), "Already known request");
    requests.emplace(contract, [&](request &r) {
      r.task = task;
      r.contract = contract;
      r.timestamp = now();
    });
  }

  // @abi action
  void push(push_payload push)
  {
    account_name sender = push.sender;
    checksum256 hash = push.hash;
    void *data = &push.data;

    uint64_t hash_id = request::pack_hash(hash);
    auto itt = requests.find(hash_id);
    eosio_assert(itt != requests.end(), "Request not found");
    request request_data = requests.get(hash_id);

    // eosio::print("\n");
    // eosio::print((std::string("data: ") + data).c_str());
    eosio::print("\n");
    printn(request_data.contract);
    eosio::print("\n");
    printn(_self);
    eosio::print("\n");
    printn(sender);
    eosio::print("\n");

    // SEND_INLINE_ACTION()
    action(
        permission_level{sender, N(active)},
        request_data.contract, N(oraclized),
        std::make_tuple(data))
        .send();
  }
};
}

extern "C" {

/// The apply method implements the dispatch of events to this contract
void apply(uint64_t receiver, uint64_t code, uint64_t action)
{
  account_name self = receiver;

  if (code == self)
  {
    auto contract = ducatur::masteroracle(self);

    if (action == N(ask))
    {
      // execute ask
      contract.ask(unpack_action_data<ducatur::ask_payload>());
    }
    if (action == N(push))
    {
      contract.push(unpack_action_data<ducatur::push_payload>());
    }
    // if (code == N(eosio) && action == N(onerror))
    // {
    //   apply_onerror(receiver, onerror::from_current_action());
    // }
    // else if (code == N(eosio.token))
    // {
    //   if (action == N(transfer))
    //   {
    //     apply_transfer(receiver, code, unpack_action_data<eosio::token::transfer_args>());
    //   }
    // }
    // else if (code == receiver)
    // {
    //   if (action == N(setowner))
    //   {
    //     apply_setowner(receiver, unpack_action_data<set_owner>());
    //   }
    // }
  }
}
}