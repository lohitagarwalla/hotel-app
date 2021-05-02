const startdate = new Date(2013, 6, 19)
console.log(startdate)
const endDate = new Date(2013, 7, 25)
console.log(endDate)

if(startdate < endDate) {
    console.log("startdate < enddate")
}
else {
    console.log('false')
}

console.log(startdate.getDate())
console.log(startdate.getFullYear())
console.log(startdate.getMonth())
console.log(startdate.toString())
startdate.setHours(12)
startdate.setMinutes(-1)
console.log(startdate.toString())
console.log()