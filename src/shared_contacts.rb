require 'json'

class SharedContacts
  def initialize
    @connection = Xing::Api.new( KEY, SECRET )
    @connection.authorize

    @profile_cache = {}
    @data = {}
    @shares = {}
  end

  def collect_data
    puts "Collecting shared contact information... (This will take a while)\n\n"

    @data["crawl_time"] = Time.now
    @data["me"] = @connection.get_me

    @connection.contact_ids["items"].each do |id|
      setup_shares_for(id)
      profile = @connection.profile(id)
      cache_add(profile)

      shared = @connection.get_shared(id)
      next unless shared && shared["users"].length

      shared["users"].each do |item|
        shared_id = item["id"]
        shared_profile = cache_get(shared_id)

        add_shared(id, shared_id)

        unless shared_profile
          shared_profile = @connection.profile(shared_id)
          cache_add(shared_profile)
          sleep 2
        end
      end

      puts "#{@shares[id].length} shares detected with #{get_profile_name(profile)}\n"
    end

    @data["profiles"] = @profile_cache
    @data["shares"] = @shares

    save_data
  end

  private

  def save_data
    filename = "data/shares_#{ @data["me"]["id"] }.json"
    puts "Saving data to #{filename}"
    File.open(filename, "w") do |file|
      file.puts JSON.generate(@data)
    end
  end

  def setup_shares_for(id)
    @shares[id] ||= []
  end

  def add_shared(owner_id, shared_id)
    # Ensure both users have a share array
    setup_shares_for(owner_id)
    setup_shares_for(shared_id)

    # Add the relationship to each user, unless it's already been cached
    @shares[owner_id]  << shared_id unless @shares[owner_id].include? shared_id
    @shares[shared_id] << owner_id  unless @shares[shared_id].include? owner_id
  end

  def get_profile_name(data)
      data["display_name"] || "Unknown"
  end

  def cache_add(profile)
    id = profile["id"]
    return if @profile_cache[id]
    @profile_cache[id] = profile
  end

  def cache_get(id)
    @profile_cache[id]
  end
end
