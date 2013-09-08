class SharedContacts
  def initialize
    @connection = Xing::Api.new( KEY, SECRET )
    @connection.authorize
    @profile_cache = {}
  end

  def collect_data
    puts "\nSHARED CONTACT INFORMATION:\n\n"

    @connection.contact_ids["items"].each do |id|
      profile = @connection.profile(id)
      cache_add(profile)

      shared = @connection.get_shared(profile["id"])
      next unless shared && shared["users"].length

      puts "Shared users with #{get_profile_name(profile)}:"

      shared["users"].each do |item|
        shared_id = item["id"]
        shared_profile = cache_get(shared_id)

        unless shared_profile
          shared_profile = @connection.profile(shared_id)
          cache_add(shared_profile)
          sleep 2
        end

        puts get_profile_name(shared_profile)
      end

      puts "\n\n"
    end
  end

  private

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
