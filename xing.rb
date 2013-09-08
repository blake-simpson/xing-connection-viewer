#encoding: utf-8

require 'json'
require 'oauth'

module Xing
  module User
    def get_me
      request_json("v1/users/me")
    end

    def contact_ids
      request_json("v1/users/me/contact_ids")["contact_ids"]
    end

    def get_shared(user_id)
      request_json("v1/users/#{user_id}/contacts/shared")["shared_contacts"]
    end

    def profile(user_id)
      users = request_json("v1/users/#{user_id}")["users"]
      users.first if users
    end
  end

  class Api
    include User

    def initialize(key, secret)
      @consumer = OAuth::Consumer.new(
        key,
        secret,
        :request_token_path => '/v1/request_token',
        :authorize_path     => '/v1/authorize',
        :access_token_path  => '/v1/access_token',
        :site               => 'https://api.xing.com'
      )
    end

    def authorize
      request_token
      url = authorize_url

      puts "Please visit:"
      puts url
      puts "and type the PIN:"
      system("open #{url}")

      pin = gets.strip
      auth_token(pin)
    end

    def auth_token(pin)
      @token = @request_token.get_access_token(:oauth_verifier => pin)
    end

    def token
      @token || raise("Not connected!")
    end

    private

    def request_json(path)
      result = token.get(
        "https://api.xing.com/#{path}"
      )
      JSON.parse(result.body)
    end

    def request_token
      @request_token = @consumer.get_request_token
    end

    def authorize_url
      @request_token.authorize_url
    end
  end
end
