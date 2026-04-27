/* ═══ DATA CONSTANTS ═══
 * Asset types, expense/income categories, navigation, cash-flow line items
 */

/* Asset types */
export const AT=[
  {v:"stock_th",l:"หุ้นไทย",i:"📊"},
  {v:"stock_us",l:"หุ้น US",i:"🇺🇸"},
  {v:"crypto",l:"Crypto",i:"₿"},
  {v:"gold",l:"ทองคำ",i:"🥇"},
  {v:"fund",l:"กองทุนรวม",i:"📈"},
  {v:"bond",l:"พันธบัตร",i:"🏦"},
  {v:"property",l:"อสังหาฯ",i:"🏠"},
  {v:"other",l:"อื่นๆ",i:"💼"},
];

/* Expense categories */
export const EC=[
  {v:"food",l:"อาหาร",i:"🍜"},
  {v:"transport",l:"เดินทาง",i:"🚗"},
  {v:"shopping",l:"ช้อปปิ้ง",i:"🛍️"},
  {v:"bills",l:"ค่าบิล",i:"💡"},
  {v:"health",l:"สุขภาพ",i:"💊"},
  {v:"entertainment",l:"บันเทิง",i:"🎬"},
  {v:"education",l:"การศึกษา",i:"📚"},
  {v:"other",l:"อื่นๆ",i:"📦"},
];

/* Income categories */
export const IC=[
  {v:"salary",l:"เงินเดือน",i:"💰"},
  {v:"freelance",l:"ฟรีแลนซ์",i:"💻"},
  {v:"investment",l:"ผลตอบแทนลงทุน",i:"📈"},
  {v:"bonus",l:"โบนัส",i:"🎁"},
  {v:"other",l:"อื่นๆ",i:"📦"},
];

/* Cash-flow statement line items (มาตรฐานไทย) */
export const CFI=[
  {k:"salary",l:"เงินเดือน (รวมค่าล่วงเวลา, ค่าคอมมิชชั่น, โบนัส)"},
  {k:"interest",l:"ดอกเบี้ยรับ"},
  {k:"dividend",l:"เงินปันผลรับ"},
  {k:"otherInc",l:"รายได้อื่น"},
];
export const CFF=[
  {k:"debtPay",l:"เงินผ่อนชำระคืนหนี้สิน"},
  {k:"lifeIns",l:"เบี้ยประกันชีวิต"},
  {k:"socSec",l:"ประกันสังคม"},
  {k:"provFund",l:"เงินสะสมกองทุนสำรองเลี้ยงชีพ"},
];
export const CFV=[
  {k:"food",l:"ค่าอาหาร"},
  {k:"phone",l:"ค่าโทรศัพท์"},
  {k:"util",l:"ค่าสาธารณูปโภค (ค่าไฟฟ้า, ค่าน้ำประปา, อื่นๆ)"},
  {k:"enter",l:"ค่าใช้จ่ายนันทนาการ"},
  {k:"tax",l:"ภาษี"},
  {k:"travel",l:"ค่าใช้จ่ายในการเดินทาง"},
  {k:"cloth",l:"ค่าเสื้อผ้าและค่าใช้จ่ายในการบำรุงรักษาตนเอง"},
  {k:"child",l:"ค่าใช้จ่ายของบุตร"},
  {k:"otherExp",l:"ค่าใช้จ่ายอื่นๆ"},
];
export const CFS=[
  {k:"save",l:"เงินออม"},
  {k:"invest",l:"เงินลงทุน"},
];
export const CF_DEFAULTS={inflow:CFI,fixed:CFF,variable:CFV,saving:CFS};

/* Navigation menu */
export const NAV=[
  {k:"dashboard",l:"Dashboard",i:"⬡",g:"ภาพรวม"},
  {k:"portfolio",l:"พอร์ตลงทุน",i:"◈",g:"ภาพรวม"},
  {k:"txn",l:"รายรับ-รายจ่าย",i:"⇄",g:"ภาพรวม"},
  {k:"calendar",l:"ปฏิทินการเงิน",i:"📅",g:"ภาพรวม"},
  {k:"recurring",l:"รายการประจำ",i:"↻",g:"ภาพรวม"},
  {k:"subs",l:"Subscription",i:"💳",g:"ภาพรวม"},
  {k:"envelopes",l:"ซองเงิน",i:"💌",g:"ภาพรวม"},
  {k:"analytics",l:"วิเคราะห์รายจ่าย",i:"📊",g:"ภาพรวม"},
  {k:"balance",l:"งบดุลส่วนบุคคล",i:"☷",g:"การเงิน"},
  {k:"cashflow",l:"งบกระแสเงินสด",i:"≋",g:"การเงิน"},
  {k:"cfdetail",l:"กระแสเงินสดละเอียด",i:"☳",g:"การเงิน"},
  {k:"goals",l:"เป้าหมาย",i:"◎",g:"วางแผน"},
  {k:"debts",l:"หนี้สิน",i:"▤",g:"วางแผน"},
  {k:"dca",l:"คำนวณ DCA",i:"⟳",g:"เครื่องมือ"},
  {k:"retire",l:"วางแผนเกษียณ",i:"☰",g:"เครื่องมือ"},
  {k:"plan",l:"สุขภาพการเงิน",i:"⊞",g:"เครื่องมือ"},
  {k:"fund",l:"กองทุนฉุกเฉิน",i:"🛡️",g:"วางแผน"},
  {k:"tax",l:"คำนวณภาษี",i:"✦",g:"เครื่องมือ"},
  {k:"taxded",l:"ลดหย่อนภาษี",i:"📋",g:"เครื่องมือ"},
  {k:"takehome",l:"เงินเดือนหลังหัก",i:"💼",g:"เครื่องมือ"},
  {k:"reports",l:"รายงาน & PDF",i:"▥",g:"รายงาน"},
  {k:"challenges",l:"ชาเลนจ์",i:"🏆",g:"สังคม"},
  {k:"streak",l:"สตรีค & รางวัล",i:"🔥",g:"สังคม"},
  {k:"profile",l:"โปรไฟล์",i:"👤",g:"บัญชี"},
  {k:"about",l:"เกี่ยวกับเรา",i:"♥",g:"บัญชี"},
];

/* Achievement Badge definitions — multiple categories
 * cat: streak | savings | goals | portfolio | txn
 * req: numeric threshold; stat key inferred from cat */
export const BADGES=[
  // ═══ STREAK ═══
  {id:"starter",cat:"streak",emoji:"🌱",name:"มือใหม่",desc:"บันทึก 3 วันติด",req:3,color:"#84CC16"},
  {id:"week",cat:"streak",emoji:"💪",name:"สัปดาห์แรก",desc:"บันทึก 7 วันติด",req:7,color:"#06B6D4"},
  {id:"twoweeks",cat:"streak",emoji:"⚡",name:"สองสัปดาห์",desc:"บันทึก 14 วันติด",req:14,color:"#8B5CF6"},
  {id:"month",cat:"streak",emoji:"🌟",name:"หนึ่งเดือน",desc:"บันทึก 30 วันติด",req:30,color:"#F59E0B"},
  {id:"quarter",cat:"streak",emoji:"🚀",name:"สามเดือน",desc:"บันทึก 90 วันติด",req:90,color:"#EC4899"},
  {id:"halfyear",cat:"streak",emoji:"🏆",name:"ครึ่งปี",desc:"บันทึก 180 วันติด",req:180,color:"#EF4444"},
  {id:"year",cat:"streak",emoji:"👑",name:"ครบปี",desc:"บันทึก 365 วันติด",req:365,color:"#FBBF24"},
  // ═══ SAVINGS (รวมเงินออมในเป้าหมาย) ═══
  {id:"save10k",cat:"savings",emoji:"💰",name:"หมื่นแรก",desc:"ออมในเป้าหมายครบ ฿10,000",req:10000,color:"#F59E0B"},
  {id:"save50k",cat:"savings",emoji:"💎",name:"ห้าหมื่น",desc:"ออมครบ ฿50,000",req:50000,color:"#8B5CF6"},
  {id:"save100k",cat:"savings",emoji:"🏦",name:"แสนแรก",desc:"ออมครบ ฿100,000",req:100000,color:"#10B981"},
  {id:"save500k",cat:"savings",emoji:"💵",name:"ครึ่งล้าน",desc:"ออมครบ ฿500,000",req:500000,color:"#EC4899"},
  {id:"save1m",cat:"savings",emoji:"💸",name:"เศรษฐี",desc:"ออมครบ ฿1,000,000",req:1000000,color:"#FBBF24"},
  // ═══ GOALS ═══
  {id:"goal1",cat:"goals",emoji:"🎯",name:"เป้าหมายแรก",desc:"ทำเป้าหมายสำเร็จ 1 อัน",req:1,color:"#3B82F6"},
  {id:"goal3",cat:"goals",emoji:"🎖️",name:"นักล่าเป้า",desc:"ทำเป้าหมายสำเร็จ 3 อัน",req:3,color:"#0EA5E9"},
  {id:"goal10",cat:"goals",emoji:"🏅",name:"แชมเปี้ยน",desc:"ทำเป้าหมายสำเร็จ 10 อัน",req:10,color:"#F59E0B"},
  // ═══ PORTFOLIO ═══
  {id:"firstAsset",cat:"portfolio",emoji:"📊",name:"นักลงทุน",desc:"เพิ่มสินทรัพย์ตัวแรก",req:1,color:"#14B8A6"},
  {id:"port100k",cat:"portfolio",emoji:"📈",name:"พอร์ต 1 แสน",desc:"พอร์ตมูลค่าครบ ฿100,000",req:100000,color:"#0EA5E9"},
  {id:"port1m",cat:"portfolio",emoji:"💹",name:"พอร์ต 1 ล้าน",desc:"พอร์ตมูลค่าครบ ฿1,000,000",req:1000000,color:"#8B5CF6"},
  // ═══ TRANSACTIONS ═══
  {id:"txn10",cat:"txn",emoji:"📝",name:"นักบันทึก",desc:"บันทึก 10 รายการ",req:10,color:"#84CC16"},
  {id:"txn100",cat:"txn",emoji:"📔",name:"นักบันทึกตัวยง",desc:"บันทึก 100 รายการ",req:100,color:"#06B6D4"},
  {id:"txn500",cat:"txn",emoji:"📚",name:"ผู้รอบรู้",desc:"บันทึก 500 รายการ",req:500,color:"#8B5CF6"},
];

/* Category metadata for display */
export const BADGE_CATS=[
  {k:"streak",l:"🔥 Streak",desc:"บันทึกต่อเนื่อง"},
  {k:"savings",l:"💰 เงินออม",desc:"สะสมในเป้าหมาย"},
  {k:"goals",l:"🎯 เป้าหมาย",desc:"ทำสำเร็จ"},
  {k:"portfolio",l:"📊 พอร์ตลงทุน",desc:"นักลงทุน"},
  {k:"txn",l:"📝 รายการ",desc:"บันทึกธุรกรรม"},
];

/* Mystery Box rewards — unlocked at streak milestones (5,10,15,20,25,30 days)
 * 5 outcomes randomly drawn. Bad outcomes create expense txn, good create income.
 * Amount 0 means no real txn (just for fun). */
export const STREAK_BOXES=[
  {id:1,kind:"loss",amount:2,title:"คุณเสียตังให้ท่านพจน์ 2 บาท",sub:"โชคไม่ดีเลยวะน้อนๆ",emoji:"😭",color:"#F87171"},
  {id:2,kind:"loss",amount:5,title:"โอนตังให้ท่านพจน์ 5 บาท",sub:"โคตรซวยเลยวะพริ๊ๆ",emoji:"💀",color:"#DC2626"},
  {id:3,kind:"loss",amount:10,title:"มอบตังให้นายท่านพจน์ซ้ะ 10 บาท",sub:"เป็นเกียรติแก่วงศ์ตระกูล",emoji:"🙏",color:"#7C2D12"},
  {id:4,kind:"win",amount:0,title:"ได้ตังจากพี่พจน์ 0 บาท",sub:"ดวงต้องดีขนาดไหนเนี่ย",emoji:"😅",color:"#94A3B8"},
  {id:5,kind:"win",amount:10,title:"รับพรจากนายพจน์ 10 บาท",sub:"โชคโคตรดีร้อยปีมีครั้งเลยงะ",emoji:"🎰",color:"#10B981"},
];
export const BOX_MILESTONES=[5,10,15,20,25,30];

/* Storage keys + default state shape */
export const SK="wealthhub-v6";
export const OSK="wealthhub-v5";
export const DF={
  assets:[],transactions:[],goals:[],debts:[],recurring:[],
  budgets:{},
  cashFlow:{monthly:{},yearly:{}},
  cfItems:null,
  balanceSheet:{cash:0,savings:0,car:0,house:0,otherAssets:0,creditCard:0,carLoan:0,homeLoan:0,otherLiab:0},
  settings:{rate:35.5},
  streak:{badges:[],freezeTokens:2,freezeResetMonth:"",reminderDismissed:"",boxesClaimed:[]},
  insights:{weeklyDismissed:[]},
  taxYear:{
    year:new Date().getFullYear(),
    salary:0, // monthly gross
    bonus:0, // annual one-time
    pvdPct:0, // % of salary contributed to PVD
    deductions:{
      spouse:false,children:0,parents:0,disabledDep:0,
      lifeIns:0,healthIns:0,parentHealthIns:0,socSec:9000,
      rmf:0,ssf:0,tesg:0,pvd:0,
      homeLoan:0,donate:0,donateDouble:0,
    },
  },
};
