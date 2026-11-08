# ProofBlocks: доробки блоків під IntelliDesc

> Записано 2026-10-08 із сесії IntelliDesc (підготовка IntelliDesc 1.10.1). Код ProofBlocks не змінювався.
> Це файл-нагадування: що треба додати в ProofBlocks, щоб IntelliDesc міг наповнювати його блоки.
> **Перед релізом:** файла немає в `.distignore`, тож або видалити, або додати туди, щоб він не потрапив у zip.

## Ідея

ProofBlocks уже йде в бік реальних даних WooCommerce (1.1.0 — дата кінця акції, 1.1.1 — залишок).
Наступний логічний крок: **Banner бере вміст із товару**. ProofBlocks сам уміє дістати базові дані
WooCommerce (назва, короткий опис, фото, посилання), а якщо активний IntelliDesc, той через фільтр
підставляє AI-текст під цей товар. Обидва плагіни працюють один без одного; зв'язка лише через
документований фільтр, жодних `Requires Plugins`.

Чому саме Banner:
- це єдиний блок, де текст і є основний вміст (заголовок, підзаголовок, CTA);
- `render_callback` уже перебудовує тіло банера (`prfbl_render_banner()`), і вже є фільтр
  `proofblocks_banner_render_body` — тобто механізм рендеру готовий, бракує атрибутів і джерела даних;
- типовий сценарій: «промо-банер товару X» на головній чи лендингу, який сам оновлюється, коли
  змінюється товар або IntelliDesc перегенеровує текст.

## Що додати в ProofBlocks (Free)

### 1. Атрибути Banner (`src/blocks/banner/block.json`)

| Атрибут | Тип | Default | Сенс |
|---|---|---|---|
| `contentSource` | string | `manual` | `manual` / `product` |
| `productId` | number | `0` | 0 = поточний товар (`prfbl_wc_current_product_id()`, як у Counter) |
| `productFields` | array | `["heading","text","image","cta"]` | які частини брати з товару; решта лишається ручною |
| `productFallback` | string | `manual` | товару нема / Woo вимкнено: `manual` (показати ручний вміст) або `hide` |

- **`save.js` не міняти**: тоді немає deprecation, а старі банери валідні (той самий підхід, що з
  Counter у 1.1.0). Ручний вміст із `save.js` і є fallback.
- На відміну від countdown, ручний fallback тут чесний: це просто текст, а не вигадана дата.

### 2. Резолвер полів + фільтр-контракт (`includes/woocommerce.php`)

```php
/**
 * @return array{heading:string,text:string,cta_text:string,cta_url:string,image_id:int,source:string}|null
 */
function prfbl_wc_banner_fields( $product_id, $attributes ) { ... }
```

- Базові значення з WooCommerce: `heading` = назва товару, `text` = короткий опис (plain text,
  обрізаний ~30 слів), `image_id` = головне фото, `cta_url` = permalink, `cta_text` = перекладний
  дефолт («Shop now»), `source` = `'woocommerce'`.
- Потім фільтр **`proofblocks_banner_product_fields`** `( array $fields, int $product_id, array $attributes ) => array`.
  Його й чіпляє IntelliDesc (і може змінити `source` на `'intellidesc'`).
- Ті самі умови, що в `prfbl_wc_get_sale_end()`: лише опублікований товар, Woo — через `prfbl_wc_active()`.
- Додати фільтр у реєстр `prfbl_get_extension_points()` (`includes/extension-api.php`), щоб контракт
  був задокументований і стабільний — IntelliDesc від нього залежить.

### 3. Рендер (`includes/render-banner.php`)

- Якщо `contentSource === 'product'`: зібрати тіло з полів резолвера (лише ті, що в `productFields`),
  з тими ж класами `proofblocks-banner__heading/__text/__cta/__media`, щоб CSS і токени працювали
  без змін. Решту (лейаут, токен, форма, анімація, Pro-відео/countdown) не чіпати.
- Екранування: текст — `esc_html`, URL — `esc_url`, фото — `wp_get_attachment_image()`. Потім
  існуючі `proofblocks_banner_render_body` + `wp_kses( ..., prfbl_block_body_allowed_html() )`.
- **Кеш сторінок:** тексти можна віддавати в HTML (вони не залежать від часу). **Ціну в банер не
  виводити** у цій ітерації — інакше та сама проблема, що із залишком (треба REST на клієнті).

### 4. Редактор (`src/blocks/banner/edit.js`)

- Панель «Content source» лише з активним WooCommerce (дані вже передає `prfbl_wc_editor_data()`).
- Пошук товару — перевикористати пікер із `src/blocks/counter/woo-source.js` (винести у `src/shared/`).
- Чекбокси `productFields`. Поля, що йдуть із товару, у канві показувати read-only з реальним вмістом.
- Для предпоказу розширити наявний REST `proofblocks/v1/wc-product/{id}` полем `banner` (результат
  `prfbl_wc_banner_fields()`, тобто вже з фільтром IntelliDesc). Дані публічні — те, що й так видно
  на сторінці товару.
- Підпис джерела під полями: «From WooCommerce» або «AI copy by IntelliDesc» (за `source`).

### 5. Крос-промо (опційно, обережно з правилами wp.org)

Коли `contentSource === 'product'` і IntelliDesc не активний — одна ненав'язлива підказка в цій
же панелі: «Хочете AI-текст банера під товар? IntelliDesc…». Лише в інспекторі блока, без
адмін-нотісів, з можливістю закрити.

## Що робить IntelliDesc (для довідки, код живе в репо IntelliDesc)

- Чіпляє `proofblocks_banner_product_fields`, лише якщо ProofBlocks достатньо новий
  (`defined( 'PRFBL_VERSION' ) && version_compare( PRFBL_VERSION, 'X.Y.Z', '>=' )`).
- Звідки текст (обрати в сесії IntelliDesc):
  - мінімум без нових AI-запитів: Pro SEO title → `heading`, SEO meta description → `text`;
  - або окрема коротка генерація «банерного тексту» (заголовок ≤ 8 слів, підзаголовок ≤ 25,
    CTA ≤ 3) у власну мету, окремим запитом, як FAQ. Її витрати пишуться полем `banner`.
- Якщо в IntelliDesc для товару немає тексту — фільтр повертає `$fields` без змін (ProofBlocks
  показує дані WooCommerce).

## Чого НЕ робити зараз

- **Pricing Table із товарів** (реальні ціни + характеристики IntelliDesc у колонках, CTA «в кошик»).
  Ідея сильна для «чесних даних», але `proofblocks/pricing-column` статичний (без `render_callback`),
  тобто це більша переробка, і вона перетинається з порівняльними таблицями IntelliDesc 1.10.2.
  Повернутися, коли буде видно, як піде 1.10.2.
- **Counter із даних IntelliDesc** (наприклад, число з характеристики «5000 mAh») — штучно, цінності
  мало. Counter лишається на даних WooCommerce (дата акції, залишок).
- Нові типи блоків (FAQ, specs тощо) — запарковано в roadmap; FAQ і характеристики IntelliDesc
  покриває своїми шорткодами в 1.10.1.

## Коли

Після 1.1.1 (залишок на складі), бо REST-ендпоінт і пікер товару там якраз допрацьовуються.
Орієнтовно ProofBlocks **1.2.0** (Free); у Pro змін не потрібно. Вписується в pivot «реальні дані
WooCommerce», тож не суперечить правилу «не переінвестовувати понад pivot».

Перевірка: старі банери без змін (немає block validation errors), `contentSource=product` без Woo і
з видаленим товаром (обидва fallback), варіативний товар, з IntelliDesc і без, Plugin Check (escaping).
