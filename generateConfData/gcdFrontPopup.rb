# #!/usr/bin/env ruby
require 'yaml'
require '../frontPopup'


def getEntityInfoLines
  oldLines = chopSeparator(IO.readlines('instructions/webapp/EntityList.txt'))
  entityInfoLines = Array.new
  for line in oldLines
    if line.index('#') != 0
      entityInfoLines.push(line)
    end
  end
  entityInfoLines
end

# separator: \n , '
def chopSeparator(oldLines)
  newLines = Array.new
  for line in oldLines
    line.chomp!
    line.delete!("'")
    newLines.push(line)
  end
  newLines
end

# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
if File.file?("output/frontPopup.yaml")
  File.delete("output/frontPopup.yaml")
end

entityInfoLines = getEntityInfoLines()
file = File.new('output/frontPopup.yaml', 'a')
for entityLine in entityInfoLines
  entityInfo = entityLine.split(',')
  tempXDetail = XDetail.new()
  tempXDetail.entity_name = entityInfo[0]
  tempXDetail.screen_name = entityInfo[1]
  if tempXDetail.entity_name == 'OptThreshold'
    tempXDetail.one_column_flag = false
  else
    tempXDetail.one_column_flag = true
  end

  itemLines = chopSeparator(IO.readlines('instructions/webapp/_addUpdate_' + tempXDetail.entity_name + '.txt'))
  itemList = Array.new()
  $id = 1
  for itemLine in itemLines
    itemInfo = itemLine.split('|')
    tempItem = XDetailItem.new()
    tempItem.internal_id = $id
    tempItem.service_name = itemInfo[0]
    tempItem.return_value = itemInfo[1]
    tempItem.default_index = itemInfo[2]
    tempItem.data_source = itemInfo[3]
    tempItem.control_type = itemInfo[4]
    tempItem.key = itemInfo[5]
    tempItem.item_name = itemInfo[6]
    tempItem.item_value = itemInfo[7]
    tempItem.item_desc = itemInfo[8]
    tempItem.desc_for_message = itemInfo[9]
    tempItem.html_element_id = itemInfo[10]
    tempItem.html_element_name = itemInfo[11]
    tempItem.checks = itemInfo[12].split(',')
    tempItem.on_check_fail = itemInfo[13].split(',')
    tempItem.mandatory = (itemInfo[14] == 'Y' ? true:false)
    tempItem.side = itemInfo[15]
    itemList.push(tempItem)
    $id += 1
  end

  tempXDetail.items = itemList
  YAML.dump(tempXDetail, file)
  # YAML.dump('#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', file)
end
file.close