const tg = window.Telegram.WebApp;

export function useTelegram() {
  const onClose = () => tg.close()

  return {
    tg,
    onClose,
    username: tg.initDataUnsafe?.user?.username || 'User',
    photo: tg.initDataUnsafe?.user?.photo_url || null
  }
};