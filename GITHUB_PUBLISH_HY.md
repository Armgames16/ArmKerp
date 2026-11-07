# ARM ԿԵՐՊ — մաքուր մեկնարկ և GitHub

Այս փաթեթում **հին հաշիվներ, խաղային արդյունքներ, ադմինի իրավունքներ կամ SQLite տվյալների բազա չկան**։ Երբ Node.js սերվերը առաջին անգամ աշխատեցվի, `database.db`-ը կստեղծվի դատարկ։

## Կարևոր՝ նախորդ տեղական տվյալները չեն ջնջվում ավտոմատ

Եթե ուզում ես նաև հին WebStorm նախագծում լրիվ զրոյացնել **բոլոր օգտատերերին** ու սերվերային պատմությունը՝ **նախ կանգնեցրու սերվերը** (`Ctrl+C`), համոզվիր, որ ճիշտ պանակում ես, հետո պահուստավորիր տվյալների բազան, եթե այն երբևէ պետք կգա։ Միայն դրանից հետո հին նախագծի `armkerp-build` պանակի PowerShell-ում գրիր՝

```powershell
Remove-Item -LiteralPath .\database.db, .\database.db-wal, .\database.db-shm -ErrorAction SilentlyContinue
```

Սա **վերջնականորեն ջնջում է բոլոր սերվերային հաշիվները, ընկերությունները, սենյակներն ու պատմությունը**։ Նոր `npm start`-ից հետո ստեղծվում է նոր դատարկ բազա։ Նախկին admin-ը պետք է նորից գրանցվի ու միայն հետո ստանա իրավունք՝ `npm run admin:grant -- USERNAME`։

Browser-ի պահված XP-ն, Daily Challenges-ը, սովորական խաղերի պատմությունը և session-ները առանձին են։ Տվյալ կայքի բացված ներդիրում DevTools > Application > Storage > Clear site data (կամ localhost-ում Console-ից `localStorage.clear(); sessionStorage.clear(); location.reload();`)։ **Ուշադրություն․ localhost:3000-ի storage-ը մաքրելը կազդի այդ հասցեով աշխատած այլ կայքերի վրա էլ**, եթե դրանք կան։ Ամեն browser/profile/device հարկավոր է մաքրել առանձին։

## GitHub

- Upload արա միայն այս պանակի մաքուր source code-ը։ Մի ավելացրու `.db`, `.env`, `node_modules` կամ API գաղտնիքներ։ `.gitignore`-ը դրանք բացառում է, եթե նախապես Git-ում չեն գրանցվել։
- Հին Git commit-երում առկա գաղտնիքները կամ DB-ն `.gitignore`-ով չեն ջնջվում. դրանց պատմությունը նույնպես պետք է մաքրել, իսկ գաղտնիքները՝ փոխել։
- GitHub Pages-ը կարող է սպասարկել միայն HTML/CSS/JS ֆայլերը։ **Online հաշիվներ, Multiplayer, Voice Chat signaling, Admin Panel** աշխատելու համար անհրաժեշտ է առանձին մշտապես աշխատող Node.js backend, persistent SQLite և HTTPS։ GitHub Pages-ը չի գործարկի `npm start`։
- `npm install`, `npm test`, `npm start`՝ տեղային փորձարկման համար։
- Մի հրապարակիր ինտերնետում Admin/Online server-ը առանց HTTPS, վստահելի hosting-ի, rate limit-ի, backup-ի և անվտանգության լրացուցիչ ստուգումների։

Այս ZIP-ի ստեղծումը ինքնին չի ջնջում քո Windows-ի հին ֆայլերը, GitHub-ի պատմությունը կամ այլ բրաուզերների storage-ը։
