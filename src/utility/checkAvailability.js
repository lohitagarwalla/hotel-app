const checkAvailability = function (bookfor, periods) {
    try {
        if (!bookfor) {
            throw new Error('bookfor is undefined')
        }
        if (bookfor.startDate > bookfor.endDate) {
            throw new Error('start date cannot be greater than end date')
        }

        return periods.every((period) => {
            if (bookfor.endDate < period.startDate) return true;
            else if (bookfor.startDate > period.endDate) return true;
            else return false
        })
    } catch (e) {
        console.log('error in checkAvailability')
        throw new Error(e)
    }
}

module.exports = checkAvailability