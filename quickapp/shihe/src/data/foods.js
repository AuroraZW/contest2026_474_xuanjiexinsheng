// 食衡 M2 本地食品目录。energyKcalPer100 是唯一能量事实源。
// parseUnits 的值表示一个该单位折合的 g/ml 数；份量热量由运行时统一计算。
const C = '中国食物成分表参考值'
const U = 'USDA FoodData Central 公开条目参考值'
const R = '食衡产品默认配方估算'

function food(id, name, aliases, category, energy, basisUnit, serving, parseUnits, sourceId, sourceNote, tags) {
  return {
    id: id,
    name: name,
    aliases: aliases,
    category: category,
    energyKcalPer100: energy,
    basisUnit: basisUnit,
    defaultServing: serving,
    parseUnits: parseUnits,
    sourceId: sourceId,
    sourceNote: sourceNote,
    tags: tags
  }
}

export const FOODS = [
  // 主食 12
  food('staple-rice', '米饭', ['白米饭'], '主食', 116, 'g', { amount: 1, unit: '碗', label: '1碗（150克）' }, { '碗': 150, '份': 150, '克': 1, 'g': 1 }, 'CFC-2002-rice-cooked', C + '；熟制米饭常见值，品种与含水量会造成差异', ['熟食', '谷物']),
  food('staple-congee', '白粥', ['大米粥', '稀饭'], '主食', 46, 'g', { amount: 1, unit: '碗', label: '1碗（250克）' }, { '碗': 250, '份': 250, '克': 1, 'g': 1 }, 'CFC-2002-rice-congee', C + '；按常见含水量估算', ['熟食', '谷物']),
  food('staple-mantou', '馒头', ['白馒头'], '主食', 223, 'g', { amount: 1, unit: '个', label: '1个（100克）' }, { '个': 100, '份': 100, '克': 1, 'g': 1 }, 'CFC-2002-steamed-bread', C + '；普通小麦粉馒头参考值', ['面食']),
  food('staple-bun', '肉包子', ['肉包'], '主食', 230, 'g', { amount: 1, unit: '个', label: '1个（100克）' }, { '个': 100, '份': 100, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-meat-bun', R + '；按面皮与猪肉馅常见比例估算', ['面食', '复合食物']),
  food('staple-noodles', '清汤面', ['汤面', '面条'], '主食', 110, 'g', { amount: 1, unit: '碗', label: '1碗（300克）' }, { '碗': 300, '份': 300, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-noodle-soup', R + '；含面、清汤和少量调味的默认配方', ['面食', '复合食物']),
  food('staple-fried-rice', '蛋炒饭', ['炒饭'], '主食', 180, 'g', { amount: 1, unit: '份', label: '1份（300克）' }, { '份': 300, '碗': 300, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-egg-fried-rice', R + '；按米饭、鸡蛋及少量烹调油估算', ['米饭', '复合食物']),
  food('staple-dumpling', '猪肉水饺', ['水饺', '饺子'], '主食', 218, 'g', { amount: 10, unit: '个', label: '10个（200克）' }, { '个': 20, '份': 200, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-pork-dumpling', R + '；按常见猪肉馅水饺估算', ['面食', '复合食物']),
  food('staple-bread', '全麦面包', ['全麦吐司'], '主食', 247, 'g', { amount: 2, unit: '片', label: '2片（60克）' }, { '片': 30, '份': 60, '克': 1, 'g': 1 }, 'USDA-FDC-whole-wheat-bread', U + '；不同品牌配方会有差异', ['面包', '谷物']),
  food('staple-oatmeal', '燕麦粥', ['煮燕麦'], '主食', 71, 'g', { amount: 1, unit: '碗', label: '1碗（250克）' }, { '碗': 250, '份': 250, '克': 1, 'g': 1 }, 'USDA-FDC-oatmeal-cooked', U + '；清水煮制、不加糖参考值', ['谷物']),
  food('staple-sweet-potato', '蒸红薯', ['红薯', '地瓜'], '主食', 86, 'g', { amount: 1, unit: '个', label: '1个（180克）' }, { '个': 180, '根': 180, '份': 180, '克': 1, 'g': 1 }, 'USDA-FDC-sweet-potato-cooked', U + '；蒸制可食部参考值', ['薯类']),
  food('staple-corn', '煮玉米', ['玉米棒', '玉米'], '主食', 96, 'g', { amount: 1, unit: '根', label: '1根（180克可食部）' }, { '根': 180, '个': 180, '份': 180, '克': 1, 'g': 1 }, 'USDA-FDC-corn-cooked', U + '；按熟甜玉米可食部参考值', ['谷物']),
  food('staple-rice-noodle', '米粉', ['米线'], '主食', 109, 'g', { amount: 1, unit: '碗', label: '1碗（300克）' }, { '碗': 300, '份': 300, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-rice-noodle', R + '；按熟米粉与清汤默认配方估算', ['复合食物']),

  // 常见菜肴 10
  food('dish-tomato-egg', '番茄炒蛋', ['西红柿炒鸡蛋', '番茄炒鸡蛋'], '常见菜肴', 105, 'g', { amount: 1, unit: '份', label: '1份（200克）' }, { '份': 200, '盘': 200, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-tomato-egg', R + '；按番茄、鸡蛋与少量烹调油估算', ['家常菜', '复合菜肴']),
  food('dish-mapotofu', '麻婆豆腐', ['麻辣豆腐'], '常见菜肴', 130, 'g', { amount: 1, unit: '份', label: '1份（220克）' }, { '份': 220, '盘': 220, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-mapo-tofu', R + '；按豆腐、肉末、酱料与烹调油估算', ['家常菜', '复合菜肴']),
  food('dish-kungpao', '宫保鸡丁', ['宫爆鸡丁'], '常见菜肴', 190, 'g', { amount: 1, unit: '份', label: '1份（220克）' }, { '份': 220, '盘': 220, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-kungpao-chicken', R + '；按鸡肉、花生、调味汁与烹调油估算', ['家常菜', '复合菜肴']),
  food('dish-potato-beef', '土豆炖牛肉', ['土豆烧牛肉'], '常见菜肴', 125, 'g', { amount: 1, unit: '份', label: '1份（250克）' }, { '份': 250, '碗': 250, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-potato-beef', R + '；按牛肉、土豆及汤汁默认比例估算', ['家常菜', '复合菜肴']),
  food('dish-braised-pork', '红烧肉', ['红烧五花肉'], '常见菜肴', 320, 'g', { amount: 1, unit: '份', label: '1份（150克）' }, { '份': 150, '盘': 150, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-braised-pork', R + '；按五花肉、糖和酱汁默认配方估算', ['家常菜', '复合菜肴']),
  food('dish-fish-fragrant-pork', '鱼香肉丝', ['鱼香肉'], '常见菜肴', 170, 'g', { amount: 1, unit: '份', label: '1份（220克）' }, { '份': 220, '盘': 220, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-yuxiang-pork', R + '；按猪肉、蔬菜、调味汁与油估算', ['家常菜', '复合菜肴']),
  food('dish-stirfried-greens', '清炒青菜', ['炒青菜'], '常见菜肴', 65, 'g', { amount: 1, unit: '份', label: '1份（200克）' }, { '份': 200, '盘': 200, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-stirfried-greens', R + '；按叶菜与少量烹调油估算', ['家常菜', '复合菜肴']),
  food('dish-cabbage-pork', '包菜炒肉', ['卷心菜炒肉'], '常见菜肴', 115, 'g', { amount: 1, unit: '份', label: '1份（220克）' }, { '份': 220, '盘': 220, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-cabbage-pork', R + '；按包菜、猪肉与少量烹调油估算', ['家常菜', '复合菜肴']),
  food('dish-braised-eggplant', '红烧茄子', ['烧茄子'], '常见菜肴', 120, 'g', { amount: 1, unit: '份', label: '1份（220克）' }, { '份': 220, '盘': 220, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-braised-eggplant', R + '；按茄子、酱汁与烹调油估算', ['家常菜', '复合菜肴']),
  food('dish-seaweed-egg-soup', '紫菜蛋花汤', ['紫菜鸡蛋汤'], '常见菜肴', 24, 'g', { amount: 1, unit: '碗', label: '1碗（300克）' }, { '碗': 300, '份': 300, '克': 1, 'g': 1 }, 'SHIHE-RECIPE-seaweed-egg-soup', R + '；按清汤、鸡蛋与紫菜默认配方估算', ['汤', '复合菜肴']),

  // 蛋白质 10
  food('protein-egg', '水煮蛋', ['煮鸡蛋', '鸡蛋'], '蛋白质', 144, 'g', { amount: 1, unit: '个', label: '1个（50克可食部）' }, { '个': 50, '份': 50, '克': 1, 'g': 1 }, 'CFC-2002-egg-boiled', C + '；水煮鸡蛋可食部参考值', ['蛋类']),
  food('protein-chicken-breast', '鸡胸肉', ['鸡胸'], '蛋白质', 165, 'g', { amount: 1, unit: '份', label: '1份（150克）' }, { '份': 150, '片': 100, '克': 1, 'g': 1 }, 'USDA-FDC-chicken-breast-cooked', U + '；熟制去皮鸡胸参考值', ['肉类']),
  food('protein-beef', '瘦牛肉', ['牛肉'], '蛋白质', 200, 'g', { amount: 1, unit: '份', label: '1份（120克）' }, { '份': 120, '片': 20, '克': 1, 'g': 1 }, 'CFC-2002-lean-beef-cooked', C + '；熟制瘦牛肉常见值', ['肉类']),
  food('protein-pork', '瘦猪肉', ['猪瘦肉'], '蛋白质', 143, 'g', { amount: 1, unit: '份', label: '1份（120克）' }, { '份': 120, '片': 20, '克': 1, 'g': 1 }, 'CFC-2002-lean-pork', C + '；瘦猪肉参考值，烹调方式会影响结果', ['肉类']),
  food('protein-salmon', '三文鱼', ['鲑鱼'], '蛋白质', 208, 'g', { amount: 1, unit: '份', label: '1份（120克）' }, { '份': 120, '片': 30, '克': 1, 'g': 1 }, 'USDA-FDC-atlantic-salmon', U + '；熟制大西洋鲑参考值', ['鱼类']),
  food('protein-shrimp', '白灼虾', ['虾仁', '虾'], '蛋白质', 99, 'g', { amount: 1, unit: '份', label: '1份（120克可食部）' }, { '份': 120, '个': 12, '克': 1, 'g': 1 }, 'USDA-FDC-shrimp-cooked', U + '；熟虾可食部参考值', ['水产']),
  food('protein-tofu', '北豆腐', ['老豆腐', '豆腐'], '蛋白质', 81, 'g', { amount: 1, unit: '份', label: '1份（150克）' }, { '份': 150, '块': 75, '克': 1, 'g': 1 }, 'CFC-2002-firm-tofu', C + '；凝固方式和含水量会造成差异', ['豆制品']),
  food('protein-soybeans', '毛豆', ['煮毛豆'], '蛋白质', 131, 'g', { amount: 1, unit: '份', label: '1份（100克可食部）' }, { '份': 100, '克': 1, 'g': 1 }, 'CFC-2002-edamame', C + '；熟毛豆可食部参考值', ['豆类']),
  food('protein-yogurt', '原味酸奶', ['无糖酸奶', '酸奶'], '蛋白质', 63, 'g', { amount: 1, unit: '盒', label: '1盒（200克）' }, { '盒': 200, '杯': 200, '份': 200, '克': 1, 'g': 1 }, 'USDA-FDC-plain-yogurt', U + '；原味全脂酸奶参考值，品牌会有差异', ['乳制品']),
  food('protein-milk', '纯牛奶', ['牛奶'], '蛋白质', 61, 'ml', { amount: 1, unit: '杯', label: '1杯（250毫升）' }, { '杯': 250, '盒': 250, '瓶': 250, '毫升': 1, 'ml': 1 }, 'CFC-2002-whole-milk', C + '；全脂液态乳参考值，按体积近似', ['乳制品']),

  // 蔬菜 8
  food('vegetable-broccoli', '西兰花', ['花椰菜'], '蔬菜', 35, 'g', { amount: 1, unit: '份', label: '1份（150克）' }, { '份': 150, '克': 1, 'g': 1 }, 'USDA-FDC-broccoli-cooked', U + '；熟制、不含额外油脂参考值', ['绿叶蔬菜']),
  food('vegetable-spinach', '菠菜', ['煮菠菜'], '蔬菜', 23, 'g', { amount: 1, unit: '份', label: '1份（150克）' }, { '份': 150, '克': 1, 'g': 1 }, 'USDA-FDC-spinach-cooked', U + '；熟制、不含额外油脂参考值', ['绿叶蔬菜']),
  food('vegetable-tomato', '番茄', ['西红柿'], '蔬菜', 18, 'g', { amount: 1, unit: '个', label: '1个（180克）' }, { '个': 180, '份': 180, '克': 1, 'g': 1 }, 'USDA-FDC-tomato-raw', U + '；生鲜可食部参考值', ['生鲜']),
  food('vegetable-cucumber', '黄瓜', ['青瓜'], '蔬菜', 15, 'g', { amount: 1, unit: '根', label: '1根（200克）' }, { '根': 200, '个': 200, '份': 200, '克': 1, 'g': 1 }, 'USDA-FDC-cucumber-raw', U + '；带皮生鲜可食部参考值', ['生鲜']),
  food('vegetable-carrot', '胡萝卜', ['红萝卜'], '蔬菜', 41, 'g', { amount: 1, unit: '根', label: '1根（100克）' }, { '根': 100, '个': 100, '份': 100, '克': 1, 'g': 1 }, 'USDA-FDC-carrot-raw', U + '；生鲜可食部参考值', ['根茎']),
  food('vegetable-cabbage', '生菜', ['叶用莴苣'], '蔬菜', 15, 'g', { amount: 1, unit: '份', label: '1份（100克）' }, { '份': 100, '克': 1, 'g': 1 }, 'USDA-FDC-lettuce-raw', U + '；生鲜可食部参考值', ['绿叶蔬菜']),
  food('vegetable-mushroom', '香菇', ['冬菇'], '蔬菜', 34, 'g', { amount: 1, unit: '份', label: '1份（100克）' }, { '份': 100, '个': 20, '克': 1, 'g': 1 }, 'CFC-2002-shiitake-fresh', C + '；鲜香菇参考值', ['菌菇']),
  food('vegetable-pumpkin', '南瓜', ['蒸南瓜'], '蔬菜', 26, 'g', { amount: 1, unit: '份', label: '1份（180克）' }, { '份': 180, '片': 60, '克': 1, 'g': 1 }, 'USDA-FDC-pumpkin-cooked', U + '；熟制、不加糖油参考值', ['瓜类']),

  // 水果 8
  food('fruit-apple', '苹果', ['红苹果'], '水果', 52, 'g', { amount: 1, unit: '个', label: '1个（200克可食部）' }, { '个': 200, '份': 200, '克': 1, 'g': 1 }, 'USDA-FDC-apple-raw', U + '；带皮可食部参考值', ['生鲜']),
  food('fruit-banana', '香蕉', ['蕉'], '水果', 89, 'g', { amount: 1, unit: '根', label: '1根（120克可食部）' }, { '根': 120, '个': 120, '份': 120, '克': 1, 'g': 1 }, 'USDA-FDC-banana-raw', U + '；可食部参考值', ['生鲜']),
  food('fruit-orange', '橙子', ['甜橙'], '水果', 47, 'g', { amount: 1, unit: '个', label: '1个（180克可食部）' }, { '个': 180, '份': 180, '克': 1, 'g': 1 }, 'USDA-FDC-orange-raw', U + '；可食部参考值', ['生鲜']),
  food('fruit-pear', '梨', ['雪梨'], '水果', 57, 'g', { amount: 1, unit: '个', label: '1个（200克可食部）' }, { '个': 200, '份': 200, '克': 1, 'g': 1 }, 'USDA-FDC-pear-raw', U + '；可食部参考值', ['生鲜']),
  food('fruit-grape', '葡萄', ['提子'], '水果', 69, 'g', { amount: 1, unit: '份', label: '1份（150克）' }, { '份': 150, '克': 1, 'g': 1 }, 'USDA-FDC-grapes-raw', U + '；生鲜可食部参考值', ['生鲜']),
  food('fruit-watermelon', '西瓜', ['西瓜片'], '水果', 30, 'g', { amount: 2, unit: '片', label: '2片（300克可食部）' }, { '片': 150, '份': 300, '克': 1, 'g': 1 }, 'USDA-FDC-watermelon-raw', U + '；可食部参考值', ['生鲜']),
  food('fruit-strawberry', '草莓', ['士多啤梨'], '水果', 32, 'g', { amount: 8, unit: '个', label: '8个（120克）' }, { '个': 15, '份': 120, '克': 1, 'g': 1 }, 'USDA-FDC-strawberries-raw', U + '；生鲜可食部参考值', ['生鲜']),
  food('fruit-kiwi', '猕猴桃', ['奇异果'], '水果', 61, 'g', { amount: 1, unit: '个', label: '1个（100克可食部）' }, { '个': 100, '份': 100, '克': 1, 'g': 1 }, 'USDA-FDC-kiwifruit-raw', U + '；可食部参考值', ['生鲜']),

  // 饮品 7
  food('drink-soy-milk', '无糖豆浆', ['豆浆'], '饮品', 31, 'ml', { amount: 1, unit: '杯', label: '1杯（250毫升）' }, { '杯': 250, '盒': 250, '瓶': 300, '毫升': 1, 'ml': 1 }, 'SHIHE-RECIPE-unsweetened-soymilk', R + '；按无糖豆浆常见固形物比例估算', ['无糖', '豆制品']),
  food('drink-cola', '可乐', ['含糖可乐'], '饮品', 42, 'ml', { amount: 1, unit: '瓶', label: '1瓶（500毫升）' }, { '瓶': 500, '罐': 330, '杯': 250, '毫升': 1, 'ml': 1 }, 'USDA-FDC-cola', U + '；含糖碳酸饮料参考值，品牌会有差异', ['含糖']),
  food('drink-zero-cola', '无糖可乐', ['零度可乐'], '饮品', 0, 'ml', { amount: 1, unit: '瓶', label: '1瓶（500毫升）' }, { '瓶': 500, '罐': 330, '杯': 250, '毫升': 1, 'ml': 1 }, 'SHIHE-LABEL-zero-cola', '常见无糖可乐产品营养标签参考；不同产品以包装标示为准', ['无糖', '碳酸饮料']),
  food('drink-orange-juice', '橙汁', ['柳橙汁'], '饮品', 45, 'ml', { amount: 1, unit: '杯', label: '1杯（250毫升）' }, { '杯': 250, '盒': 250, '瓶': 300, '毫升': 1, 'ml': 1 }, 'USDA-FDC-orange-juice', U + '；不额外加糖的橙汁参考值', ['果汁']),
  food('drink-coffee', '黑咖啡', ['美式咖啡', '美式'], '饮品', 2, 'ml', { amount: 1, unit: '杯', label: '1杯（300毫升）' }, { '杯': 300, '瓶': 300, '毫升': 1, 'ml': 1 }, 'USDA-FDC-coffee-brewed', U + '；不加糖奶的冲煮咖啡参考值', ['无糖']),
  food('drink-milk-tea', '珍珠奶茶', ['奶茶'], '饮品', 75, 'ml', { amount: 1, unit: '杯', label: '1杯（500毫升）' }, { '杯': 500, '瓶': 500, '毫升': 1, 'ml': 1 }, 'SHIHE-RECIPE-bubble-tea', R + '；按含糖奶茶与珍珠的默认配方估算，门店差异较大', ['含糖', '复合饮品']),
  food('drink-tea', '无糖茶', ['绿茶', '茶水'], '饮品', 0, 'ml', { amount: 1, unit: '杯', label: '1杯（300毫升）' }, { '杯': 300, '瓶': 500, '毫升': 1, 'ml': 1 }, 'USDA-FDC-tea-brewed', U + '；不加糖奶的冲泡茶参考值', ['无糖']),

  // 零食 5
  food('snack-potato-chips', '薯片', ['马铃薯片'], '零食', 536, 'g', { amount: 1, unit: '袋', label: '1小袋（50克）' }, { '袋': 50, '份': 50, '克': 1, 'g': 1 }, 'USDA-FDC-potato-chips', U + '；不同品牌及口味会有差异', ['咸味']),
  food('snack-chocolate', '牛奶巧克力', ['巧克力'], '零食', 535, 'g', { amount: 1, unit: '份', label: '1份（30克）' }, { '份': 30, '块': 10, '克': 1, 'g': 1 }, 'USDA-FDC-milk-chocolate', U + '；不同品牌配方会有差异', ['甜味']),
  food('snack-biscuit', '苏打饼干', ['饼干'], '零食', 430, 'g', { amount: 4, unit: '片', label: '4片（32克）' }, { '片': 8, '份': 32, '盒': 100, '克': 1, 'g': 1 }, 'SHIHE-LABEL-soda-cracker', '常见苏打饼干产品营养标签范围的保守参考值；以包装标示为准', ['烘焙']),
  food('snack-nuts', '混合坚果', ['坚果'], '零食', 607, 'g', { amount: 1, unit: '份', label: '1份（30克）' }, { '份': 30, '袋': 30, '克': 1, 'g': 1 }, 'USDA-FDC-mixed-nuts', U + '；无额外糖油的混合坚果近似值', ['坚果']),
  food('snack-milk-candy', '牛奶糖', ['奶糖'], '零食', 410, 'g', { amount: 3, unit: '个', label: '3个（18克）' }, { '个': 6, '份': 18, '克': 1, 'g': 1 }, 'SHIHE-LABEL-milk-candy', '常见牛奶糖产品营养标签范围的保守参考值；以包装标示为准', ['甜味'])
]

export function calculateFoodKcal(foodItem, basisAmount) {
  return Math.round(foodItem.energyKcalPer100 * basisAmount / 100)
}

export function validateFoodCatalog(foods) {
  const ids = {}
  const names = {}
  foods.forEach(function (item) {
    if (ids[item.id]) throw new Error('食品 id 冲突：' + item.id)
    ids[item.id] = true
    ;[item.name].concat(item.aliases).forEach(function (name) {
      if (names[name]) throw new Error('食品名称或别名冲突：' + name)
      names[name] = true
    })
  })
  return true
}

validateFoodCatalog(FOODS)
