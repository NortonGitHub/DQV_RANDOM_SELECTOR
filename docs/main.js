const MAX = [47, 75, 77];

var characters;
var result;
var clipboard = new ClipboardJS('.copy');

var viewModel = {
  group: [{
      key: 'A',
      value: 'A'
    },
    {
      key: 'B',
      value: 'B'
    },
    {
      key: 'C',
      value: 'C'
    },
    {
      key: 'D',
      value: 'D'
    },
    {
      key: 'E',
      value: 'E'
    },
    {
      key: 'F',
      value: 'F'
    },
    {
      key: 'G',
      value: 'G'
    },
    {
      key: 'H',
      value: 'H'
    },
    {
      key: 'I',
      value: 'I'
    },
    {
      key: 'J',
      value: 'J'
    },
    {
      key: 'K',
      value: 'K'
    },
    {
      key: 'L',
      value: 'L'
    },
    {
      key: 'M',
      value: 'M'
    },
    {
      key: 'N',
      value: 'N'
    },
    {
      key: 'O',
      value: 'O'
    },
    {
      key: 'P',
      value: 'P'
    },
    {
      key: 'Q',
      value: '男の子'
    },
    {
      key: 'R',
      value: '女の子'
    },
    {
      key: 'S',
      value: 'フローラ'
    },
    {
      key: 'T',
      value: 'ビアンカ'
    },
    {
      key: 'U',
      value: 'デボラ'
    },
    {
      key: 'V',
      value: 'サンチョ'
    },
    {
      key: 'W',
      value: 'ピピン'
    }
  ]
};

ko.applyBindings(viewModel);

//初期読込
$(function () {
  $.ajax({
      type: 'GET',
      url: './dqvlist.csv',
      dataType: 'text'
    })
    .done(function (data, textStatus, jqXHR) {
      characters = readCsv(data);
    })
    .fail(function (data, textStatus, jqXHR) {
      alert("仲間情報の取得に失敗しました.");
    });
});

//抽出ボタンの押下
$('#start').on('click', function () {
  $('#extract').val('');
  var headcount = $('#headcount').val();
  let viewStr = "";
  let version = $('input:radio[name="console"]:checked').val();

  characters = characters.filter(e => e.isException != "TRUE");

  if (!checkHeadcount(headcount, version)) {
    alert("仲間の人数は1~" + MAX[version] + "の間にしてください.");
    return;
  }

  result = extractCharacters(headcount);

  if (result == null) {
    alert("入力情報を確かめてください.");
    return;
  }

  for (let r of result) {
    viewStr += r.name + '\n';
  }

  $('#extract').val(viewStr.substring(0, viewStr.lastIndexOf("\n")));
  modifyHeight(result.length);
});

//機種変によるキャラ数の変更
$('[name="console"]').on('click', function (e) {
  let num = e.currentTarget.value;
  $('#headcount').attr('max', MAX[num]);
});

//csvデータの読み込み
function readCsv(data) {
  return $.csv.toObjects(data);
}

//指定抽出数の判定
function checkHeadcount(val, version) {
  return (val > 0 && val <= MAX[version]);
}

//キャラの抽出処理
function extractCharacters(headcount) {
  
  let lvMin = $('#lvMin').val();
  let lvMax = $('#lvMax').val();
  let result = new Array();
  let isABride = false;

  let shuffled = shuffleList(characters);
  let filered = filteringList(shuffled);

  let addChara = 0;
  let i = 0;

  if (lvMin > lvMax) {
    return null;
  }

  while (addChara < headcount && i < 79) {
    let chara = filered[i];
    i++;

    if (chara) {
      //キャラが花嫁(ビアンカ、フローラ、デボラ)だった場合の判定式
      if (chara.N >= 75 && chara.N <= 77) {
        if (isABride) {
          continue;
        } else {
          isABride = true;
        }
      }
      result.push(chara);
      addChara++;
    }
  }

  return result;
}

//キャラリストのシャッフル
function shuffleList(list) {
  let newList = list;
  let n = list.length;

  for (let i = n - 1; i > 0; i--) {
    let k = Math.floor(Math.random() * (i + 1));
    let tmp = newList[i];
    newList[i] = newList[k];
    newList[k] = tmp;
  }

  return newList;
}

//フィルタリング
function filteringList(list) {
  let version = $('input:radio[name="console"]:checked').val();
  let goal = $('input:radio[name="goal"]:checked').val();
  let lvMin = $('#lvMin').val();
  let lvMax = $('#lvMax').val();
  let checkedGroup = [];
  $('[name="group"]:checked').each(function () {
    checkedGroup.push($(this).val());
  });

  return list.filter(c =>
    c.version <= version &&
    c.goal <= goal &&
    c.requiredLv >= lvMin &&
    c.requiredLv <= lvMax &&
    checkedGroup.includes(c.group));
}

//結果表示枠の高さの変更
function modifyHeight(length) {
  let lineHeight = parseInt($('#extract').css('lineHeight'));
  $('#extract').height(lineHeight * length);
}