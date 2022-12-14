const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

// Извлекаем информацию о типе сборке (dev/prod) из системной переменной NODE_ENV:
const isDev = process.env.NODE_ENV === "development";


module.exports = {
  //================================================================ CONTEXT ================================================================\\
  // CONTEXT - это абсолютная строка для каталога, содержащего входные файлы. Далее все пути внутри webpack.config.js к обрабатываемым файлам
  // будут указываться относительно context.
  context: path.resolve(__dirname, 'src'),

  //================================================================= ENTRY =================================================================\\
  // ENTRY - указывает, какой модуль(модули) webpack следует использовать, чтобы начать сборку проекта. В качестве значения указывается объект,
  // свойства которого являются названиями точек входа, а значения - пути к соответствующим модулям.
  entry: {
    main: './index.js',                 // Точка входа №1 - собирает основные скрипты;
    analytics: './analytics-module.js', // Точка входа №2 - собирает скрипты, относящиеся к аналитике;
  },

  //================================================================= OUTPUT ================================================================\\
  // Свойство output указывает webpack, куда отправлять создаваемые им пакеты и как их называть. В случаях, когда в конфигурации используется
  // более одной точки входа, вам следует использовать "замены" - [...], чтобы гарантировать, что каждый файл имеет уникальное имя.
  // - [name]         - заменяется на имя соответствующего входного файла;
  // - [contenthash]  - добавляет к названию уникальный хэш, сформированный на основе контента файлов, используемых в пакете. Необходим для
  //                    решения проблем, связанных с хэшированием и обновлением страницы;
  output: {
    filename: `[name].${isDev ? "[contenthash]." : ""}js`,  // Названия создаваемых пакетов;
    path: path.resolve(__dirname, 'dist'),                  // Путь расположения создаваемых пакетов;
    clean: true,                                            // Отчистка директории, перед сохранением обновлённых пакетов;
  },

  //================================================================= LOADERS ===============================================================\\

  // Внутри свойства module указываются Loader-ы и их настройки. Loader-ы - сущности, которые позволяют webpack обрабатывать файлы других
  // типов, а не отлько JS и JSON.
  // Свойство test - определяет, какой файл или файлы должны быть преобразованы;
  // Свойство use  - указывает, какой Loader следует использовать для выполнения преобразования;
  
  // Простыми словами работа Loader-ов реализована следующим образом: Если при сборке проекта встречаются импортированные файлы с расширением
  // из "test", то к ним необходимо применить Loder-ы из "use".

  module: {
    // Используемые Loader-ы:
    rules: [
      // <=== Обработка файлов стилей ===> \\
      {
        test: /\.sass$/i,
        // Свойство use поддерживает использование нескольких Loader-ов, в таком случае они располагаются в массиве и выполняются справа
        // налево (1й загрузчик передает свой результат (ресурс с примененными преобразованиями) следующему и так далее):
        //  1. sass-loader - предназначен для обработки sass-файлов;
        //  2. css-loader - предназначен для обработки css-файлов;
        //  3. В зависимости от режима разработки:
        //     - style-loader - добавляет стили в секцию head в html;
        //     - MiniCssExtractPlugin.loader - добавляет стили в качестве отдельного файла;
        //     Для производственных сборок рекомендуется извлечь CSS из вашего пакета, чтобы в дальнейшем использовать параллельную
        //     загрузку ресурсов CSS или JS. Для режима разработки вы можете использовать style-loader, потому что он вводит CSS в
        //     DOM с помощью multiple и работает быстрее.
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ],
      },
      // <=== Babel ===> \\
      // Babel занимается преобразованием кода ECMAScript 2015+ в обратно совместимую версию JavaScript в текущих и более старых браузерах. 
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true,
          }
        }
      },
      // <=== Обработка изображений ===> \\
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      // <=== Обработка шрифтов ===> \\
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ]
  },

  // Используемые loader-ы:
  // - npm install --save-dev babel-loader @babel/core @babel/preset-env webpack;
  // - npm install --save-dev style-loader css-loader sass-loader sass;
  // - npm install --save-dev babel-loader @babel/core @babel/preset-env @babel/preset-typescript;

  //================================================================= PLUGINS ===============================================================\\

  // Plugin-ы - это сущности, которые могут быть использованы для выполнения более широкого круга задач, с которыми не справятся Loader-ы.
  // Чтобы использовать плагин, необходимо запросить его с помощью оператора new() и добавить в массив плагинов:
  
  plugins: [
    // Генерирует HTML-файл для вашего приложения и автоматически вставляет все сгенерированные вами пакеты в этот файл:
    new HtmlWebpackPlugin({ template: './index.html', title: "vovandrelo" }),
    // Переносит статические файлы из src в build:
    new CopyPlugin({ patterns: [{ from: './assets/favicon.ico', to: path.resolve(__dirname, 'dist') }]}),

    // Извлекает CSS в отдельные файлы - создает CSS-файл для каждого JS-файла, который содержит CSS:
  ].concat(isDev ? [] : [new MiniCssExtractPlugin({ filename: `[name].${isDev ? "[contenthash]." : ""}css` })]),  
  // Для производственных сборок рекомендуется извлечь CSS из вашего пакета, чтобы в дальнейшем использовать параллельную загрузку ресурсов
  // CSS или JS. Для режима разработки вы можете использовать style-loader, потому что он вводит CSS в DOM с помощью multiple и работает быстрее.

  // Используемые плагины:
  // - npm install --save-dev html-webpack-plugin
  // - npm install copy-webpack-plugin --save-dev
  // - npm install --save-dev mini-css-extract-plugin

  //===================================================== РЕАЛИЗАЦИЯ ЛОКАЛЬНОГО СЕРВЕРА ====================================================\\

  // DevServer позволяет локально запустить проект в браузере:
  devServer: {
    static: {
      directory: "./"
    },
    compress: true,
    port: 9000,
    open: true,
  },

  // Используемыей NPM-пакет: npm install -D webpack-dev-server

  //=============================================================== ОПТИМИЗАЦИЯ ============================================================\\

  // При импорте одних и тех же больших библиотек в разные модули, в финальной сборке сильно увеличивается количество кода, так как
  // по-умолчанию webpack вставляет библиотеки в каждый из указанных модулей без какой-либо оптимизации. Данная настройка позволяет
  // импортировать в финальный пакет большую библиотеку 1 раз, а затем использовать её в необходимых модулях.
  optimization: {
    splitChunks: {
      chunks: "all",
    }
  },
  // Использование карт при режиме разработки:
  devtool: isDev ? 'source-map' : false,
  
  //================================================================== MODE =================================================================\\

  // MODE - указывает webpack каким образом использовать свои встроенные оптимизации. Настройка размещается либо в файле webpack.config.js,
  // либо задаётся через CLI (см. скрипты в package.json). Второй вариант имеет больший приоритет.
  mode: 'development'
};