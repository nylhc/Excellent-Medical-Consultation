enum MyDirection {
  Top = 1,
  Rigth = 2
}

function log(type: MyDirection) {
  console.log(type)
}

log(MyDirection.Rigth)
