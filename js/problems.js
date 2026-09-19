/**
 * AlgoOlimp — Masalalar Bazasi (Problemset)
 * Maktab va litsey o'quvchilari uchun olimpiada darajasidagi saralangan masalalar
 * Tillar: C++, Python 3, JavaScript (Node.js)
 */

const PROBLEMS_DATA = [
  // --- 1. CHIZIQLI ALGORITMLAR ---
  {
    id: "P101",
    title: "A + B Muammosi",
    topic: "linear",
    topicName: "Chiziqli algoritmlar",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Sizga ikkita butun son $A$ va $B$ beriladi. Ularning yig'indisini hisoblang.",
    inputFormat: "Bitta qatorda ikkita butun son $A$ va $B$ bo'sh joy bilan ajratilgan holda kiritiladi ($-10^9 \\le A, B \\le 10^9$).",
    outputFormat: "Masala javobini — $A$ va $B$ yig'indisini ekranga chiqaring.",
    samples: [
      { input: "3 5", output: "8", explanation: "3 + 5 = 8" },
      { input: "-10 25", output: "15", explanation: "-10 + 25 = 15" }
    ],
    hint: "Katta sonlar bilan ishlaganda C++ da int o'rniga long long ishlatish tavsiya etiladi. JS da BigInt ishlatiladi.",
    templates: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << "\\n";
    }
    return 0;
}`,
      python: `import sys

def solve():
    line = sys.stdin.read().split()
    if not line:
        return
    a, b = int(line[0]), int(line[1])
    print(a + b)

if __name__ == "__main__":
    solve()`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const a = BigInt(input[0]);
    const b = BigInt(input[1]);
    console.log((a + b).toString());
}

solve();`
    }
  },

  {
    id: "P102",
    title: "To'g'ri to'rtburchak perimetri va yuzi",
    topic: "linear",
    topicName: "Chiziqli algoritmlar",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "To'g'ri to'rtburchakning tomonlari $a$ va $b$ berilgan. Uning yuzi ($S = a \\times b$) va perimetrini ($P = 2 \\times (a + b)$) hisoblang.",
    inputFormat: "Bitta qatorda ikkita musbat butun son $a$ va $b$ kiritiladi ($1 \\le a, b \\le 10^6$).",
    outputFormat: "Bitta qatorda to'g'ri to'rtburchak yuzi va perimetrini bitta bo'sh joy bilan ajratib chiqaring.",
    samples: [
      { input: "4 5", output: "20 18", explanation: "Yuzi: 4 * 5 = 20, Perimetri: 2 * (4 + 5) = 18" }
    ],
    hint: "Tomonlar ko'paytmasi $10^{12}$ gacha yetishi mumkin, C++ da long long, JS da BigInt zarur.",
    templates: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    long long S = a * b;
    long long P = 2 * (a + b);
    cout << S << " " << P << "\\n";
    return 0;
}`,
      python: `a, b = map(int, input().split())
print(a * b, 2 * (a + b))`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const a = BigInt(input[0]);
    const b = BigInt(input[1]);
    const S = a * b;
    const P = 2n * (a + b);
    console.log(\`\${S} \${P}\`);
}

solve();`
    }
  },

  // --- 2. SHART OPERATORLARI (IF-ELSE) ---
  {
    id: "P201",
    title: "Uchta sondan eng kattasi",
    topic: "conditions",
    topicName: "Shart operatorlari",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Sizga uchta butun son $A$, $B$ va $C$ beriladi. Ularning orasidagi eng katta qiymatni toping.",
    inputFormat: "Bitta qatorda uchta butun son $A$, $B$ va $C$ kiritiladi ($-10^9 \\le A, B, C \\le 10^9$).",
    outputFormat: "Eng katta sonning qiymatini ekranga chiqaring.",
    samples: [
      { input: "12 45 8", output: "45", explanation: "Eng katta son 45" },
      { input: "-5 -1 -9", output: "-1", explanation: "Manfiy sonlar ichida -1 eng kattasi" }
    ],
    hint: "C++ da max, Pythonda max(), JS da Math.max yoki solishtirish shartlaridan foydalaning.",
    templates: {
      cpp: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    long long a, b, c;
    cin >> a >> b >> c;
    cout << max(a, max(b, c)) << "\\n";
    return 0;
}`,
      python: `a, b, c = map(int, input().split())
print(max(a, b, c))`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 3) return;
    const a = BigInt(input[0]);
    const b = BigInt(input[1]);
    const c = BigInt(input[2]);
    let maxVal = a;
    if (b > maxVal) maxVal = b;
    if (c > maxVal) maxVal = c;
    console.log(maxVal.toString());
}

solve();`
    }
  },

  {
    id: "P202",
    title: "Kabisa yili",
    topic: "conditions",
    topicName: "Shart operatorlari",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Berilgan $Y$ yili kabisa yili ekanligini aniqlang. Yil 4 ga bo'linib 100 ga bo'linmasa, yoki 400 ga bo'linsa u kabisa yili hisoblanadi.",
    inputFormat: "Bitta butun son $Y$ ($1 \\le Y \\le 10^5$).",
    outputFormat: "Agar yil kabisa yili bo'lsa \"YES\", aks holda \"NO\" chiqaring.",
    samples: [
      { input: "2024", output: "YES", explanation: "2024 yili 4 ga bo'linadi va 100 ga bo'linmaydi." },
      { input: "1900", output: "NO", explanation: "1900 yili 100 ga bo'linadi, lekin 400 ga bo'linmaydi." }
    ],
    hint: "Shart: (Y % 4 == 0 && Y % 100 != 0) || (Y % 400 == 0)",
    templates: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int y;
    cin >> y;
    if ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) {
        cout << "YES\\n";
    } else {
        cout << "NO\\n";
    }
    return 0;
}`,
      python: `y = int(input())
if (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0):
    print("YES")
else:
    print("NO")`,
      javascript: `const fs = require('fs');

function solve() {
    const y = parseInt(fs.readFileSync(0, 'utf-8').trim(), 10);
    if ((y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

solve();`
    }
  },

  {
    id: "P203",
    title: "Uchburchak mavjudligi",
    topic: "conditions",
    topicName: "Shart operatorlari",
    difficulty: "O'rta",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Uchta musbat son $a$, $b$, $c$ berilgan. Tomonlari shu uzunlikka teng bo'lgan uchburchak yasash mumkinmi? (Uchburchak tengsizligi: ixtiyoriy ikki tomon yig'indisi uchinchi tomondan qat'iy katta bo'lishi shart).",
    inputFormat: "Bitta qatorda uchta butun son $a, b, c$ ($1 \\le a, b, c \\le 10^9$).",
    outputFormat: "Agar uchburchak yasash mumkin bo'lsa \"YES\", aks holda \"NO\" chiqaring.",
    samples: [
      { input: "3 4 5", output: "YES", explanation: "3+4>5, 3+5>4, 4+5>3 to'g'ri." },
      { input: "1 2 5", output: "NO", explanation: "1 + 2 < 5 bo'lgani uchun uchburchak hosil bo'lmaydi." }
    ],
    hint: "Uchburchak bo'lishi uchun a + b > c va a + c > b va b + c > a bo'lishi kerak.",
    templates: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long a, b, c;
    cin >> a >> b >> c;
    if (a + b > c && a + c > b && b + c > a) {
        cout << "YES\\n";
    } else {
        cout << "NO\\n";
    }
    return 0;
}`,
      python: `a, b, c = map(int, input().split())
if a + b > c and a + c > b and b + c > a:
    print("YES")
else:
    print("NO")`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 3) return;
    const a = BigInt(input[0]);
    const b = BigInt(input[1]);
    const c = BigInt(input[2]);
    if (a + b > c && a + c > b && b + c > a) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

solve();`
    }
  },

  // --- 3. SIKLLAR (LOOPS) ---
  {
    id: "P301",
    title: "Raqamlar yig'indisi",
    topic: "loops",
    topicName: "Sikllar (for, while)",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Musbat butun $N$ soni berilgan. Uning barcha raqamlari yig'indisini hisoblang.",
    inputFormat: "Bitta butun son $N$ ($1 \\le N \\le 10^{18}$).",
    outputFormat: "$N$ sonining raqamlari yig'indisini ekranga chiqaring.",
    samples: [
      { input: "12345", output: "15", explanation: "1 + 2 + 3 + 4 + 5 = 15" },
      { input: "1009", output: "10", explanation: "1 + 0 + 0 + 9 = 10" }
    ],
    hint: "N soni 10^18 gacha bo'lishi mumkin! Satr sifatida o'qib har bir belgisini qo'shib chiqish eng oson yo'l.",
    templates: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    long long sum = 0;
    for (char c : s) {
        sum += (c - '0');
    }
    cout << sum << "\\n";
    return 0;
}`,
      python: `s = input().strip()
print(sum(int(c) for c in s))`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    let sum = 0n;
    for (const char of s) {
        if (char >= '0' && char <= '9') {
            sum += BigInt(char);
        }
    }
    console.log(sum.toString());
}

solve();`
    }
  },

  {
    id: "P302",
    title: "Tub sonni aniqlash",
    topic: "loops",
    topicName: "Sikllar (for, while)",
    difficulty: "O'rta",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Berilgan musbat butun $N$ soni tub yoki murakkab ekanligini aniqlang. Agar $N=1$ bo'lsa, u tub ham, murakkab ham emas.",
    inputFormat: "Bitta butun son $N$ ($1 \\le N \\le 10^9$).",
    outputFormat: "Agar son tub bo'lsa \"PRIME\", murakkab bo'lsa \"COMPOSITE\", 1 ga teng bo'lsa \"NEITHER\" chiqaring.",
    samples: [
      { input: "17", output: "PRIME", explanation: "17 faqat 1 ga va o'ziga bo'linadi." },
      { input: "1", output: "NEITHER", explanation: "1 tub ham, murakkab ham emas." },
      { input: "12", output: "COMPOSITE", explanation: "12 soni 2, 3, 4, 6 ga bo'linadi." }
    ],
    hint: "Sonning tubligini tekshirish uchun siklni 2 dan sqrt(N) gacha aylantirish yetarli ($O(\\sqrt{N})$).",
    templates: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    if (n <= 1) {
        cout << "NEITHER\\n";
        return 0;
    }
    bool isPrime = true;
    for (long long i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            isPrime = false;
            break;
        }
    }
    if (isPrime) cout << "PRIME\\n";
    else cout << "COMPOSITE\\n";
    return 0;
}`,
      python: `n = int(input())
if n <= 1:
    print("NEITHER")
else:
    is_prime = True
    i = 2
    while i * i <= n:
        if n % i == 0:
            is_prime = False
            break
        i += 1
    print("PRIME" if is_prime else "COMPOSITE")`,
      javascript: `const fs = require('fs');

function solve() {
    const n = BigInt(fs.readFileSync(0, 'utf-8').trim());
    if (n <= 1n) {
        console.log("NEITHER");
        return;
    }
    let isPrime = true;
    for (let i = 2n; i * i <= n; i++) {
        if (n % i === 0n) {
            isPrime = false;
            break;
        }
    }
    console.log(isPrime ? "PRIME" : "COMPOSITE");
}

solve();`
    }
  },

  {
    id: "P303",
    title: "EKUB va EKUK (GCD & LCM)",
    topic: "loops",
    topicName: "Sikllar (for, while)",
    difficulty: "O'rta",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Ikkita butun son $A$ va $B$ berilgan. Ularning Eng Katta Umumiy Bo'luvchisi (EKUB) va Eng Kichik Umumiy Karralisi (EKUK) ni toping.",
    inputFormat: "Bitta qatorda ikkita natural son $A$ va $B$ ($1 \\le A, B \\le 10^9$).",
    outputFormat: "Bitta qatorda EKUB va EKUK qiymatlarini bitta bo'sh joy bilan chiqaring.",
    samples: [
      { input: "12 18", output: "6 36", explanation: "EKUB(12, 18) = 6, EKUK(12, 18) = (12*18)/6 = 36" }
    ],
    hint: "Evklid algoritmidan foydalaning: gcd(a, b) = gcd(b, a % b). EKUK = (a * b) / EKUB.",
    templates: {
      cpp: `#include <iostream>
#include <numeric>
using namespace std;

long long gcd(long long a, long long b) {
    while (b) {
        a %= b;
        swap(a, b);
    }
    return a;
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long g = gcd(a, b);
    long long l = (a / g) * b;
    cout << g << " " << l << "\\n";
    return 0;
}`,
      python: `import math

a, b = map(int, input().split())
g = math.gcd(a, b)
l = (a * b) // g
print(g, l)`,
      javascript: `const fs = require('fs');

function gcd(a, b) {
    while (b > 0n) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const a = BigInt(input[0]);
    const b = BigInt(input[1]);
    const g = gcd(a, b);
    const l = (a / g) * b;
    console.log(\`\${g} \${l}\`);
}

solve();`
    }
  },

  // --- 4. MASSIVLAR (ARRAYS) ---
  {
    id: "P401",
    title: "Eng katta element va uning o'rni",
    topic: "arrays",
    topicName: "Massivlar (Arrays)",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "$N$ ta butun sondan iborat massiv berilgan. Massivdagi eng katta element qiymatini va uning 1-indeksdagi o'rnini toping. Agar bir nechta bo'lsa, birinchi uchraganini oling.",
    inputFormat: "Birinchi qatorda butun son $N$ ($1 \\le N \\le 10^5$). Ikkinchi qatorda $N$ ta butun son $A_i$ ($-10^9 \\le A_i \\le 10^9$).",
    outputFormat: "Bitta qatorda eng katta element qiymati va uning 1-asoslangan indeksini chiqaring.",
    samples: [
      { input: "5\\n3 18 9 18 4", output: "18 2", explanation: "Eng katta son 18 bo'lib, birinchi marta 2-o'rinda uchradi." }
    ],
    hint: "Maksimum qiymatni saqlab boruvchi o'zgaruvchi va uning pozitsiyasini oling.",
    templates: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long maxVal = -2e18;
    int maxPos = 1;
    for (int i = 1; i <= n; i++) {
        long long val;
        cin >> val;
        if (val > maxVal) {
            maxVal = val;
            maxPos = i;
        }
    }
    cout << maxVal << " " << maxPos << "\\n";
    return 0;
}`,
      python: `n = int(input())
arr = list(map(int, input().split()))
max_val = arr[0]
pos = 1
for i, v in enumerate(arr, start=1):
    if v > max_val:
        max_val = v
        pos = i
print(max_val, pos)`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    let maxVal = BigInt(input[1]);
    let maxPos = 1;
    for (let i = 1; i <= n; i++) {
        const val = BigInt(input[i]);
        if (val > maxVal) {
            maxVal = val;
            maxPos = i;
        }
    }
    console.log(\`\${maxVal} \${maxPos}\`);
}

solve();`
    }
  },

  {
    id: "P402",
    title: "Massivni teskari tartibda chiqarish",
    topic: "arrays",
    topicName: "Massivlar (Arrays)",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Sizga $N$ ta butun sondan iborat massiv berilgan. Massiv elementlarini teskari tartibda bitta qatorda chiqaring.",
    inputFormat: "Birinchi qatorda $N$ ($1 \\le N \\le 10^5$), ikkinchi qatorda $N$ ta butun son.",
    outputFormat: "Teskari tartibdagi massiv elementlarini bo'sh joy bilan ajratib chiqaring.",
    samples: [
      { input: "4\\n10 20 30 40", output: "40 30 20 10", explanation: "Massiv teskarisi chiqarildi." }
    ],
    hint: "Siklni oxirgi elementdan birinchisiga qarab aylantiring yoki reverse() metodidan foydalaning.",
    templates: {
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = n - 1; i >= 0; i--) {
        cout << a[i] << (i == 0 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
      python: `n = int(input())
arr = input().split()
print(" ".join(reversed(arr)))`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    const arr = input.slice(1, n + 1);
    console.log(arr.reverse().join(' '));
}

solve();`
    }
  },

  {
    id: "P403",
    title: "Noyob elementlar soni",
    topic: "arrays",
    topicName: "Massivlar (Arrays)",
    difficulty: "O'rta",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "$N$ ta sondan iborat massiv berilgan. Massivda nechta har xil (takrorlanmas) element borligini aniqlang.",
    inputFormat: "Birinchi qatorda $N$ ($1 \\le N \\le 2 \\times 10^5$), ikkinchi qatorda massiv elementlari ($-10^9 \\le A_i \\le 10^9$).",
    outputFormat: "Noyob elementlar umumiy sonini chiqaring.",
    samples: [
      { input: "6\\n2 3 2 5 3 2", output: "3", explanation: "Massivda faqat 2, 3 va 5 sonlari bor, ya'ni 3 ta unikal element." }
    ],
    hint: "C++ da std::set yoki std::sort + unique, Pythonda set(), JavaScriptda new Set() juda qulay.",
    templates: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a.begin(), a.end());
    int uniqueCount = unique(a.begin(), a.end()) - a.begin();
    cout << uniqueCount << "\\n";
    return 0;
}`,
      python: `import sys

def solve():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    arr = set(data[1:n+1])
    print(len(arr))

if __name__ == "__main__":
    solve()`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    const unique = new Set(input.slice(1, n + 1));
    console.log(unique.size);
}

solve();`
    }
  },

  // --- 5. SATRLAR (STRINGS) ---
  {
    id: "P501",
    title: "Palindrom so'z",
    topic: "strings",
    topicName: "Satrlar (Strings)",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Berilgan satr chapdan o'ngga va o'ngdan chapga bir xil o'qilsa, u palindrom deyiladi (masalan, \"radar\", \"level\"). Satr palindrom ekanligini tekshiring. Registr (katta-kichik harf) hisobga olinsin.",
    inputFormat: "Bitta satr $S$ (bo'sh joysiz, uzunligi $1 \\le |S| \\le 10^5$).",
    outputFormat: "Agar palindrom bo'lsa \"YES\", aks holda \"NO\" chiqaring.",
    samples: [
      { input: "madam", output: "YES", explanation: "madam teskari o'qilganda ham madam." },
      { input: "olimp", output: "NO", explanation: "olimp teskari o'qilganda pmilo bo'ladi." }
    ],
    hint: "Satr boshidan va oxiridan ikkita ko'rsatkich (pointer) bilan taqqoslab boring.",
    templates: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    int l = 0, r = s.length() - 1;
    bool ok = true;
    while (l < r) {
        if (s[l] != s[r]) {
            ok = false;
            break;
        }
        l++;
        r--;
    }
    cout << (ok ? "YES" : "NO") << "\\n";
    return 0;
}`,
      python: `s = input().strip()
if s == s[::-1]:
    print("YES")
else:
    print("NO")`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    const rev = s.split('').reverse().join('');
    console.log(s === rev ? "YES" : "NO");
}

solve();`
    }
  },

  {
    id: "P502",
    title: "Unli harflar soni",
    topic: "strings",
    topicName: "Satrlar (Strings)",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Ingliz alifbosidagi kichik harflardan iborat $S$ satri berilgan. Unda nechta unli harf ('a', 'e', 'i', 'o', 'u') borligini sanang.",
    inputFormat: "Bitta qatorda faqat kichik ingliz harflaridan iborat $S$ satri ($1 \\le |S| \\le 10^5$).",
    outputFormat: "Satrdagi unli harflar sonini chiqaring.",
    samples: [
      { input: "algorithmic", output: "4", explanation: "'a', 'o', 'i', 'i' — jami 4 ta unli." }
    ],
    hint: "Har bir belgini tekshiring: if (c == 'a' || c == 'e' || ...)",
    templates: {
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    int count = 0;
    for (char c : s) {
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
            count++;
        }
    }
    cout << count << "\\n";
    return 0;
}`,
      python: `s = input().strip()
vowels = set("aeiou")
print(sum(1 for c in s if c in vowels))`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    let count = 0;
    for (const char of s) {
        if (vowels.has(char)) count++;
    }
    console.log(count);
}

solve();`
    }
  },

  // --- 6. SARALASH VA QIDIRUV (SORTING & BINARY SEARCH) ---
  {
    id: "P601",
    title: "O'sish tartibida saralash",
    topic: "sorting",
    topicName: "Saralash va Qidiruv",
    difficulty: "Oson",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "$N$ ta butun sondan iborat massiv berilgan. Uni kamaymaydigan (o'sish) tartibida saralang.",
    inputFormat: "Birinchi qatorda $N$ ($1 \\le N \\le 10^5$), ikkinchi qatorda $N$ ta butun son ($-10^9 \\le A_i \\le 10^9$).",
    outputFormat: "Saralangan sonlarni bitta bo'sh joy bilan chiqaring.",
    samples: [
      { input: "5\\n4 2 7 1 3", output: "1 2 3 4 7", explanation: "O'sish tartibida saralandi." }
    ],
    hint: "C++ da std::sort, Pythonda arr.sort(), JavaScriptda arr.sort((a,b) => ...).",
    templates: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    sort(a.begin(), a.end());
    for (int i = 0; i < n; i++) {
        cout << a[i] << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
      python: `import sys

def solve():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    arr = list(map(int, data[1:n+1]))
    arr.sort()
    print(*(arr))

if __name__ == "__main__":
    solve()`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const n = parseInt(input[0], 10);
    const arr = input.slice(1, n + 1).map(BigInt);
    arr.sort((a, b) => (a < b ? -1n : a > b ? 1n : 0n));
    console.log(arr.join(' '));
}

solve();`
    }
  },

  {
    id: "P602",
    title: "Ikkilik qidiruv (Binary Search)",
    topic: "sorting",
    topicName: "Saralash va Qidiruv",
    difficulty: "O'rta",
    timeLimit: "1.5s",
    memoryLimit: "256MB",
    statement: "O'sish tartibida saralangan $N$ ta butun sondan iborat massiv va $Q$ ta so'rov berilgan. Har bir so'rovda berilgan $X$ soni massivda mavjud bo'lsa \"YES\", aks holda \"NO\" deb javob bering.",
    inputFormat: "Birinchi qatorda $N$ va $Q$ ($1 \\le N, Q \\le 10^5$). Ikkinchi qatorda saralangan $N$ ta son. Uchinchi qatorda $Q$ ta qidirilayotgan son.",
    outputFormat: "Har bir so'rov uchun alohida qatorda \"YES\" yoki \"NO\" chiqaring.",
    samples: [
      { 
        input: "5 3\\n1 3 5 7 9\\n3 6 9", 
        output: "YES\\nNO\\nYES", 
        explanation: "3 massivda bor (YES), 6 yo'q (NO), 9 bor (YES)." 
      }
    ],
    hint: "Ikkilik qidiruv (Binary Search) har bir so'rov uchun O(log N) talab etadi.",
    templates: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, q;
    if (!(cin >> n >> q)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    while (q--) {
        long long x;
        cin >> x;
        if (binary_search(a.begin(), a.end(), x)) {
            cout << "YES\\n";
        } else {
            cout << "NO\\n";
        }
    }
    return 0;
}`,
      python: `import sys
import bisect

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    q = int(input_data[1])
    arr = list(map(int, input_data[2:2+n]))
    queries = list(map(int, input_data[2+n:2+n+q]))

    results = []
    for x in queries:
        idx = bisect.bisect_left(arr, x)
        if idx < n and arr[idx] == x:
            results.append("YES")
        else:
            results.append("NO")
    print("\\n".join(results))

if __name__ == "__main__":
    solve()`,
      javascript: `const fs = require('fs');

function binarySearch(arr, x) {
    let l = 0, r = arr.length - 1;
    while (l <= r) {
        const mid = (l + r) >> 1;
        if (arr[mid] === x) return true;
        if (arr[mid] < x) l = mid + 1;
        else r = mid - 1;
    }
    return false;
}

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0) return;
    const n = parseInt(input[0], 10);
    const q = parseInt(input[1], 10);
    const arr = input.slice(2, 2 + n).map(BigInt);
    const queries = input.slice(2 + n, 2 + n + q).map(BigInt);

    const results = [];
    for (const x of queries) {
        results.push(binarySearch(arr, x) ? "YES" : "NO");
    }
    console.log(results.join('\\n'));
}

solve();`
    }
  },

  {
    id: "P603",
    title: "Olimpiada Reytingi (Saralash)",
    topic: "sorting",
    topicName: "Saralash va Qidiruv",
    difficulty: "Qiyin",
    timeLimit: "1.0s",
    memoryLimit: "256MB",
    statement: "Musobaqada $N$ nafar o'quvchi qatnashdi. Har bir o'quvchining ismi va to'plagan balli beriladi. O'quvchilarni to'plagan bali bo'yicha kamayish (yuqoridan pastga) tartibida saralang. Agar ballar teng bo'lsa, ismlari bo'yicha alifbo tartibida joylashtiring.",
    inputFormat: "Birinchi qatorda $N$ ($1 \\le N \\le 10^4$). Keyingi $N$ ta qatorda o'quvchi ismi (bo'sh joysiz satr) va balli (butun son, $0 \\le B \\le 1000$).",
    outputFormat: "Saralangan ro'yxatni har bir qatorda \"Ism Ball\" ko'rinishida chiqaring.",
    samples: [
      {
        input: "3\\nAli 85\\nVali 95\\nJasur 85",
        output: "Vali 95\\nAli 85\\nJasur 85",
        explanation: "Vali 95 ball bilan 1-o'rinda. Ali va Jasur 85 ball, alifbo tartibida Ali oldin keladi."
      }
    ],
    hint: "Struktura/Obyekt va maxsus taqqoslash funksiyasi (custom comparator) dan foydalaning.",
    templates: {
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

bool compareStudents(const Student& a, const Student& b) {
    if (a.score != b.score) {
        return a.score > b.score; // Katta ball birinchi
    }
    return a.name < b.name; // Alifbo bo'yicha
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<Student> v(n);
    for (int i = 0; i < n; i++) {
        cin >> v[i].name >> v[i].score;
    }
    sort(v.begin(), v.end(), compareStudents);
    for (const auto& s : v) {
        cout << s.name << " " << s.score << "\\n";
    }
    return 0;
}`,
      python: `n = int(input())
students = []
for _ in range(n):
    parts = input().split()
    students.append((parts[0], int(parts[1])))

# -score bo'yicha kamayish, name bo'yicha alifbo
students.sort(key=lambda s: (-s[1], s[0]))

for name, score in students:
    print(f"{name} {score}")`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length === 0) return;
    const n = parseInt(input[0], 10);
    const students = [];
    let idx = 1;
    for (let i = 0; i < n; i++) {
        students.push({
            name: input[idx++],
            score: parseInt(input[idx++], 10)
        });
    }

    students.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
    });

    console.log(students.map(s => \`\${s.name} \${s.score}\`).join('\\n'));
}

solve();`
    }
  }
];
