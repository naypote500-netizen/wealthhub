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
  {k:"tax",l:"คำนวณภาษี",i:"✦",g:"เครื่องมือ"},
  {k:"reports",l:"รายงาน & PDF",i:"▥",g:"รายงาน"},
  {k:"challenges",l:"ชาเลนจ์",i:"🏆",g:"สังคม"},
  {k:"streak",l:"สตรีค & รางวัล",i:"🔥",g:"สังคม"},
  {k:"about",l:"เกี่ยวกับเรา",i:"♥",g:"อื่นๆ"},
];

/* Streak Badge definitions — unlocked when current_streak >= req */
export const BADGES=[
  {id:"starter",emoji:"🌱",name:"มือใหม่",desc:"บันทึก 3 วันติด",req:3,color:"#84CC16"},
  {id:"week",emoji:"💪",name:"สัปดาห์แรก",desc:"บันทึก 7 วันติด",req:7,color:"#06B6D4"},
  {id:"twoweeks",emoji:"⚡",name:"สองสัปดาห์",desc:"บันทึก 14 วันติด",req:14,color:"#8B5CF6"},
  {id:"month",emoji:"🌟",name:"หนึ่งเดือน",desc:"บันทึก 30 วันติด",req:30,color:"#F59E0B"},
  {id:"quarter",emoji:"🚀",name:"สามเดือน",desc:"บันทึก 90 วันติด",req:90,color:"#EC4899"},
  {id:"halfyear",emoji:"🏆",name:"ครึ่งปี",desc:"บันทึก 180 วันติด",req:180,color:"#EF4444"},
  {id:"year",emoji:"👑",name:"ครบปี",desc:"บันทึก 365 วันติด",req:365,color:"#FBBF24"},
];

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
  streak:{badges:[],freezeTokens:2,freezeResetMonth:"",reminderDismissed:""},
};
