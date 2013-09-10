#encoding: utf-8

require 'pry'
require './src/xing.rb'
require './src/shared_contacts.rb'
# Defined KEY and SECRET constants
require './keys.rb'

collector = SharedContacts.new
collector.collect_data
