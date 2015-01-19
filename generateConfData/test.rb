# require 'yaml'
# configuration = { 'color' => 'blue',
#                   'font' => 'new romain',
#                   'font-size'  => 7 }
# open('output/test.yaml', 'w') { |f|
#   YAML.dump(configuration, f)
# }
#
#
# YAML.dump


# aFile = File.new("test.txt", "r")
# if aFile
#   content = aFile.gets()
#   puts content
# else
#   puts "Unable to open file!"
# end

# arr = IO.readlines("test.txt")
# puts arr.size
# for str in arr
#   puts str
# end

# IO.foreach("test.txt"){|line|
#   puts line
# }
# puts 'end'

# str = "aaa,bbb,cc"
# arr = str.split(',')

# IO.foreach("test.txt"){|line|
#   puts line.size
#   puts line.length
#   line = line.chop
#   arr = line.split(',')
#   puts arr.size
#   puts arr
#   if arr.size == 1 and arr[0] == "\n"
#     puts 'empty'
#   end
#   puts '==========================================================='
# }

# class Box
#   # 初始化类变量
#   @@count = 0
#   def initialize(w,h)
#     # 给实例变量赋值
#     @width, @height = w, h
#
#     @@count += 1
#   end
#
#   def self.printCount()
#     puts "Box count is : #@@count"
#   end
# end
#
#
#
# require 'yaml'
# open('output/test.yaml', 'w') { |f|
#   lines = IO.readlines("datasource/test.txt")
#   configuration = { 'entity_name' => [[1,11,111,1111],2,3,4,5,6],
#                     'entity_title' => 'new romain',
#                     'doller_fields'  => 7 }
#   box1 = Box.new(10, 20)
#   YAML.dump(box1, f)
# }


#
# require 'yaml'
# require '../frontDataService'
# File.open('output/dataservice.yaml','w'){|f|
#   lines = IO.readlines('datasource/CrossController.txt')
#   entityList = Array.new
#   for line in lines
#     entityList.push(XSeriveItem.new())
#   end
#
# }


# require 'yaml'
# class ServiceItem
#   def initialize(name,sex)
#     @name = name
#     @sex = sex
#   end
# end
#
# class DataSercie
#   def initialize(list)
#     @entity_list = list
#   end
# end
#
# open('output/dataservice.yaml','w'){|f|
#   lines = IO.readlines('datasource/CrossController.txt')
#   entityList = Array.new
#   for line in lines
#     arr = line.split(',')
#     arr[1] = arr[1].split("\n")[0]
#     entityList.push(ServiceItem.new(arr[0],arr[1]))
#   end
#   YAML.dump(DataSercie.new(entityList),f)
# }


# require '../frontDataService'
#
# aa = XSeriveItem.new()
# aa.entity_name = 'ddddd'
# puts aa.entity_name()

# def generateDataSource
#   require 'yaml'
#   require '../frontDataService'
#
#   open('output/frontDataService.yaml', 'w') { |f|
#     lines = IO.readlines('datasource/CrossController.txt')
#     entityList = Array.new
#     for line in lines
#       tempArr = line.split(',')
#       tempItem = XSeriveItem.new
#       tempItem.entity_name =tempArr[0]
#       tempItem.read_all_service = tempArr[1]
#       tempItem.save_service = tempArr[2]
#       tempItem.update_service = tempArr[3]
#       tempItem.delete_service = tempArr[4]
#       tempItem.mass_delete_service = tempArr[5]
#       tempItem.read_all_url = tempArr[6]
#       tempItem.save_url = tempArr[7]
#       tempItem.update_url = tempArr[8]
#       tempItem.delete_url = tempArr[9]
#       tempItem.no_filter_url = tempArr[10]
#       tempItem.filter_url = tempArr[11]
#       tempItem.select_url = tempArr[12]
#       tempItem.client_variable = tempArr[13]
#       lastStr = tempArr[14]
#       if lastStr.index("\n")
#         lastStr.chop!
#       end
#       tempItem.client_variable_list = lastStr
#       entityList.push(tempItem)
#     end
#
#     dataservice = XDataSerive.new()
#     dataservice.entity_list =entityList
#     YAML.dump(dataservice, f)
#   }
# end
#
# generateDataSource






str = "||||textarea||note||Note|Note|elNote|elNote|'max256orNull'|Max length of Note is 256.|N|"
# puts str
# puts str.delete('""')
# arr = str.split('|')
# for a in arr
#   puts 'name:' + a
# end
# puts str.split(',')
# puts str == 'd'? 'Y':'N'












arr = Array.new
arr.push(1)
arr.push(1)
puts arr[3]










