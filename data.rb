#encoding: utf-8

require 'pry'
require './src/xing.rb'
require './src/shared_contacts.rb'

KEY = '7ee45757712c345aff68'
SECRET = '411a74eec535ce6b4631f49f0b278da9cee0fc4b'

collector = SharedContacts.new
collector.collect_data
