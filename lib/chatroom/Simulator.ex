defmodule Simulator do
    
    def simulate(total) do

            # total = String.to_integer(num)
            mapOfSockets = start_Client(Enum.to_list(1..total), %{})
            
            setupStaticData(total, mapOfSockets)
            # Start the clients
            IO.inspect mapOfSockets
            Process.sleep(5000)
            # Start the simulation
            start_simulation()
            # Process.sleep(15000)
            # spawn(fn-> getMyMentions() end)
            # Process.sleep(5000)
            # spawn(fn-> searchByHashtag() end)
            # Process.sleep(5000)
            # spawn(fn-> killClients(ipAddr) end)
            # :timer.sleep(:infinity)
      end
    
    def log(str) do
        IO.puts str
    end
    
    def setupStaticData(total, mapOfSockets) do
        :ets.new(:staticFields, [:named_table])
        :ets.insert(:staticFields, {"totalNodes", total})
        :ets.insert(:staticFields, {"sampleTweets", ["Please come to my party. ","Don't you dare come to my party. ","Why won't you invite me to your party? ","But I wanna come to your party. ","Okay I won't come to your party. "]})
        :ets.insert(:staticFields, {"hashTags", ["#adoptdontshop ","#UFisGreat ","#Fall2017 ","#DinnerParty ","#cutenesscatified "]})
        :ets.insert(:staticFields, {"mapOfSockets", mapOfSockets})
    end
    
    def start_Client([client | numClients], mapOfSockets) do
            # Start the socket driver process
            {:ok, socket} = SocketDriver.start_link(
              ChatroomWeb.Endpoint,
              ChatroomWeb.UserSocket
            )
        
            payload = %{username: "user" <> Integer.to_string(client), password: "123"}
            # socket.connect()
            
            # SocketDriver.join(socket, "lobby")
            SocketDriver.push(socket, :lobby, "register_account", payload)
            SocketDriver.push(socket, :lobby, "login", payload)
            mapOfSockets = Map.put(mapOfSockets, "user" <> Integer.to_string(client), socket)
            start_Client(numClients, mapOfSockets)
    end
    
    def start_Client([], mapOfSockets) do
            mapOfSockets
    end


    def getMyMentions() do
        [{_, numClients}] = :ets.lookup(:staticFields, "totalNodes")
        IO.inspect "GETTING MY MENTIONS"
    
        # select 5 random to kill and store these ids in a list
        clientIds = for i<- 1..5 do
            client = Enum.random(1..numClients)
        end
    
        for j <- clientIds do
            spawn(fn -> GenServer.cast(String.to_atom("user"<>Integer.to_string(j)),{:getMyMentions}) end)
        end
    end
    
    def searchByHashtag() do
        [{_, hashTags}] = :ets.lookup(:staticFields, "hashTags")
        IO.inspect "SEARCHING BY HASHTAG"
        
        # select 5 random to kill and store these ids in a list
        for i<- 1..5 do
            hashTag = Enum.random(hashTags)
            IO.inspect hashTag
            spawn(fn -> GenServer.cast(String.to_atom("user"<>Integer.to_string(i)),{:search_by_hashtags, String.trim(hashTag)}) end)
        end
    
    end
    
    def killClients(ipAddr) do
        [{_, numClients}] = :ets.lookup(:staticFields, "totalNodes")
        
        # select 5 random to kill and store these ids in a list
        clientIds = for i<- 1..5 do
            client = Enum.random(1..numClients)
        end
         IO.inspect clientIds
    
        for j <- clientIds do
            spawn(fn -> GenServer.cast(String.to_atom("user"<>Integer.to_string(j)),{:kill_self}) end)
        end
    
        # sleep for some time
        Process.sleep(10000)
        # start the genserver again and get their state back from server - query the tweets etc
    
        IO.inspect "STARTING AGAIN!!!!!"
        for j <- clientIds do
            spawn(fn -> Client.start_link("user" <> Integer.to_string(j), ipAddr) end)
            spawn(fn -> Client.register_user("user" <> Integer.to_string(j), ipAddr) end)
        end
    
    end
    
    def start_simulation() do 
            [{_, numClients}] = :ets.lookup(:staticFields, "totalNodes")
            [{_, mapOfSockets}] = :ets.lookup(:staticFields, "mapOfSockets")
            assignfollowers(numClients, mapOfSockets) # add zipf logic
            Process.sleep(5000)
            delay = 3000 # add zipf logic
        # listofFequency = 
          for client <- 1..numClients do
            username = "user" <> Integer.to_string(client)
                spawn(fn -> generateMultipleTweets(username, Map.get(mapOfSockets,username), delay * client) end)
                # spawn(fn -> createMultipleRetweets(username, Map.get(mapOfSockets,username)) end)
                # {"user" <> Integer.to_string(client) , (numThreads*1000) / (delay * client)}
          end
    
        #   IO.inspect listofFequency
    end
    
    def generateMultipleTweets(username, socket, delay) do
                # get the tweet content.
                content = Simulator.getTweetContent(username)
                # IO.inspect content
                payload = %{tweetText: content , username: username}
                GenServer.cast(String.to_atom(username),{:tweet, content})
                IO.inspect SocketDriver.push(socket, "lobby", "tweet", payload)
                Process.sleep(delay)
            
                generateMultipleTweets(username, socket, delay)
    end
    
    def getSum([first|tail], sum) do
        sum = sum + first
        getSum(tail,sum)
    end
    
    def getSum([], sum) do
        sum
    end
    
    def assignfollowers(numClients, mapOfSockets) do
        # calculate cons somehow 
        # [{_, mapOfSockets}] = :ets.lookup(:staticFields, "mapOfSockets")
        
        harmonicList = for j <- 1..numClients do
                         round(1/j)
                       end
        c=(100/getSum(harmonicList,0))
    
        
        for tweeter <- 1..numClients, i <- 1..round(Float.floor(c/tweeter)) do
    
                follower = ("user" <> Integer.to_string(Enum.random(1..numClients)))
                mainUser = ("user" <> Integer.to_string(tweeter))
                SocketDriver.push(Map.get(mapOfSockets, follower), "lobby", "subscribeTo", %{username2: mainUser, selfId: follower})
        end
    
        listofFollowersCount = 
        for tweeter <- 1..numClients do
        {"user" <> Integer.to_string(tweeter) , round(Float.floor(c/tweeter))}
        end
        IO.inspect listofFollowersCount
    end
    
    
    def getTweetContent(username) do
        [{_, sampleTweets}] = :ets.lookup(:staticFields, "sampleTweets")
        rand_Index = Enum.random(1..Enum.count(sampleTweets))
        selectedTweet = Enum.at(sampleTweets, rand_Index - 1)
        
        [{_, hashTags}] = :ets.lookup(:staticFields, "hashTags")
        numTags = Enum.random(0..5)
    
        hashTagList = 
        if numTags > 0 do
            for i <- Enum.to_list(1..numTags) do
                 Enum.at(hashTags, i - 1)
            end
        else
            []
        end
        [{_, numClients}] = :ets.lookup(:staticFields, "totalNodes")
        numMentions = Enum.random(0..5)
    
        mentionsList = 
        if numMentions > 0 do
            for i <- Enum.to_list(1..numMentions) do
                 "@user" <> Integer.to_string(Enum.random(1..numClients)) <> " "
            end
        else
            []
        end
        selectedTweet <> condense(hashTagList, "") <> condense(mentionsList, "")
    
        end
    
        def condense([first|tail], string) do
            string = string <> first
            condense(tail, string)
        end
    
        def condense([], string) do
            string
        end
    
      # Returns the IP address of the machine the code is being run on.
      def findIP(iter) do
        list = Enum.at(:inet.getif() |> Tuple.to_list, 1)
        if (elem(Enum.at(list, iter), 0) == {127, 0, 0, 1}) do
          findIP(iter+1)
        else
          elem(Enum.at(list, iter), 0) |> Tuple.to_list |> Enum.join(".")
        end
      end
      
    end