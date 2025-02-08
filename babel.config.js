module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",      // Имя модуля, через который будете импортировать переменные
          path: ".env",            // Путь к файлу с переменными окружения
          allowUndefined: true,    // Если переменная не определена в .env, не будет ошибки
        }
      ]
    ]
  };
};
