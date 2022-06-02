function compare(a, b) {
  if (a.message.view === null && b.message.view !== null) {
    return -1
  }
  if (a.message.view !== null && b.message.view === null) {
    return 1
  }
  return 0
}

const orderNotifications = (notifications: any) => {
  const ordered = notifications.sort(compare)

  ordered.forEach((notification) => {
    console.log(notification.message.view)
  })

  return ordered
}

export default orderNotifications
