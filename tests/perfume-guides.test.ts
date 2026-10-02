import assert from "node:assert/strict";
import test from "node:test";
import { STRONG_WITH_YOU_GUIDES, ACQUA_DI_GIO_GUIDES, AVENTUS_GUIDES, BLACK_OPIUM_GUIDES, GOOD_GIRL_GUIDES, HAWAS_GUIDES, IMAGINE_GUIDES, KHAMRAH_QAHWA_GUIDES, LE_MALE_ELIXIR_GUIDES, MYRRH_TONKA_GUIDES, NO_5_GUIDES, OMB_LEATHER_GUIDES, OMBRE_NOMADE_GUIDES, OUD_WOOD_GUIDES, RED_TOBACCO_GUIDES, SAUVAGE_GUIDES, SRK_SPECIAL_GUIDES, TERRE_DE_HERMES_GUIDES, THE_BLUE_GUIDES, VIKING_SPIRIT_GUIDES, Y_EDP_GUIDES, ONE_MILLION_GUIDES, ALTHAIR_GUIDES, ANGELS_SHARE_GUIDES, BRIGHT_CRYSTAL_GUIDES, EROS_GUIDES, GODDESS_GUIDES, HER_GUIDES, HUGO_BOSS_MAN_GUIDES, INVICTUS_GUIDES, JADORE_GUIDES, LA_NUIT_GUIDES, MOST_WANTED_GUIDES, NIGHT_OUT_GUIDES, NOIR_EXTREME_GUIDES, PACIFIC_CHILL_GUIDES, TOBACCO_VANILLE_GUIDES, ALLURE_SPORT_GUIDES, BR_540_GUIDES, GUILTY_POUR_HOMME_GUIDES, HAWAS_ICE_GUIDES, HOMME_INTENSE_GUIDES, JAZZ_CLUB_GUIDES, LIBRE_INTENSE_GUIDES, MYSELF_GUIDES, OUD_MARACUJA_GUIDES, PARADOXE_GUIDES, ROMA_INTENSE_GUIDES, SAUVAGE_ELIXIR_GUIDES, SPICE_INFERNO_GUIDES, FLORA_GUIDES, PERFUME_GUIDES, getGuideCluster, getPerfumeGuide } from "../lib/perfume-guides";
test("the Strong With You cluster has 15 unique topics and rejects unknown slugs",()=>{
 assert.equal(STRONG_WITH_YOU_GUIDES.length,15);
 assert.equal(new Set(STRONG_WITH_YOU_GUIDES.map(guide=>guide.slug)).size,15);
 assert.equal(new Set(STRONG_WITH_YOU_GUIDES.map(guide=>guide.answer)).size,15);
 assert.equal(getPerfumeGuide("unknown-guide"),undefined);
 for(const guide of STRONG_WITH_YOU_GUIDES){assert.equal(guide.sections.length,2); assert.ok(guide.answer.length>120);assert.ok(guide.sections.every(section=>section.question.endsWith("?")));}
});
test("Acqua di Gio guides resolve to their own product and never mix clusters",()=>{
 assert.equal(ACQUA_DI_GIO_GUIDES.length,15);
 assert.equal(new Set(PERFUME_GUIDES.map(guide=>guide.slug)).size,PERFUME_GUIDES.length);
 for(const guide of ACQUA_DI_GIO_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"acqua-di-gio-profondo");
  assert.ok(cluster.guides.every(item=>item.cluster==="acqua-di-gio"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.equal(getGuideCluster(STRONG_WITH_YOU_GUIDES[0]).productId,"stronger-with-you-intensely");
 assert.match(getPerfumeGuide("hume-acqua-di-gio-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-acqua-di-gio-to-profondo")!.answer,/not a measured similarity/);
});
test("Aventus cluster uses Creed identity and keeps its links within the right perfume",()=>{
 assert.equal(AVENTUS_GUIDES.length,15);
 assert.equal(PERFUME_GUIDES.length,765);
 for(const guide of AVENTUS_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"creed-aventus");
  assert.equal(cluster.brand,"Creed");
  assert.ok(cluster.guides.every(item=>item.cluster==="aventus"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-aventus-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-aventus-to-creed-aventus")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-aventus-longevity")!.answer,/reliable hour range cannot/);
 assert.equal(getGuideCluster(ACQUA_DI_GIO_GUIDES[0]).brand,"Armani");
});
test("Myrrh & Tonka guides use their product and Cologne Intense reference",()=>{
 assert.equal(MYRRH_TONKA_GUIDES.length,15);
 for(const guide of MYRRH_TONKA_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"myrrh-tonka");
  assert.equal(cluster.brand,"Jo Malone London");
  assert.equal(cluster.inspiration,"Jo Malone Myrrh & Tonka Cologne Intense");
  assert.ok(cluster.reference.includes("jomalone.com.au"));
  assert.ok(cluster.guides.every(item=>item.cluster==="myrrh-tonka"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-myrrh-tonka-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-myrrh-tonka-to-jo-malone-myrrh-tonka")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-myrrh-tonka-longevity")!.answer,/reliable hour range cannot/);
});
test("Le Male Elixir guides use their own product and the original Parfum reference",()=>{
 assert.equal(LE_MALE_ELIXIR_GUIDES.length,15);
 for(const guide of LE_MALE_ELIXIR_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"le-male-elixir");
  assert.equal(cluster.brand,"Jean Paul Gaultier");
  assert.equal(cluster.inspiration,"Jean Paul Gaultier Le Male Elixir Parfum");
  assert.ok(cluster.reference.includes("jeanpaulgaultier.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="le-male-elixir"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-le-male-elixir-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-le-male-elixir-to-jean-paul-gaultier-le-male-elixir")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-le-male-elixir-longevity")!.answer,/reliable hour range cannot/);
});
test("Khamrah Qahwa guides resolve to the existing product and Lattafa reference",()=>{
 assert.equal(KHAMRAH_QAHWA_GUIDES.length,15);
 for(const guide of KHAMRAH_QAHWA_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"lattafa-khamrah-qahwa-100ml");
  assert.equal(cluster.brand,"Lattafa");
  assert.equal(cluster.inspiration,"Lattafa Khamrah Qahwa");
  assert.ok(cluster.reference.includes("lattafa.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="khamrah-qahwa"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-khamrah-qahwa-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-khamrah-qahwa-to-lattafa-khamrah-qahwa")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-khamrah-qahwa-longevity")!.answer,/reliable hour range cannot/);
});
test("Imagine guides resolve to the existing product and Louis Vuitton reference",()=>{
 assert.equal(IMAGINE_GUIDES.length,15);
 for(const guide of IMAGINE_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"lv-imagination");
  assert.equal(cluster.brand,"Louis Vuitton");
  assert.equal(cluster.inspiration,"Louis Vuitton Imagination");
  assert.ok(cluster.reference.includes("louisvuitton.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="imagine"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-imagine-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-imagine-to-louis-vuitton-imagination")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-imagine-longevity")!.answer,/reliable hour range cannot/);
});
test("Hawas guides use original Hawas identity and Rasasi disclosure",()=>{
 assert.equal(HAWAS_GUIDES.length,15);
 for(const guide of HAWAS_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"hawas");
  assert.equal(cluster.brand,"Rasasi");
  assert.equal(cluster.inspiration,"Rasasi Hawas for Him");
  assert.ok(cluster.reference.includes("rasasi.com.sa"));
  assert.ok(cluster.guides.every(item=>item.cluster==="hawas"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-hawas-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-hawas-to-rasasi-hawas")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-hawas-longevity")!.answer,/reliable hour range cannot/);
});
test("Good Girl guides keep their product, designer and related cluster distinct",()=>{
 assert.equal(GOOD_GIRL_GUIDES.length,15);
 for(const guide of GOOD_GIRL_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"good-girl");
  assert.equal(cluster.brand,"Carolina Herrera");
  assert.ok(cluster.reference.includes("carolinaherrera.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="good-girl"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-good-girl-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-good-girl-to-carolina-herrera-good-girl")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-good-girl-longevity")!.answer,/reliable hour range cannot/);
});
test("Black Opium guides resolve to their own product and YSL reference",()=>{
 assert.equal(BLACK_OPIUM_GUIDES.length,15);
 for(const guide of BLACK_OPIUM_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"black-opium");
  assert.equal(cluster.brand,"YSL");
  assert.ok(cluster.reference.includes("yslbeautyus.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="black-opium"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-black-opium-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-black-opium-to-ysl-black-opium")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-black-opium-longevity")!.answer,/reliable hour range cannot/);
});
test("comparison and review guides disclose evidence limits rather than invented results",()=>{
 assert.match(getPerfumeGuide("hume-strong-with-you-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-strong-with-you-to-intensely")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-strong-with-you-longevity")!.answer,/does not have a documented/);
 assert.ok(!JSON.stringify(STRONG_WITH_YOU_GUIDES).includes("99%"));
});

test("No 5 guides keep the Chanel Eau de Parfum identity and evidence limits",()=>{
 assert.equal(NO_5_GUIDES.length,15);
 for(const guide of NO_5_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"no-5");
  assert.equal(cluster.brand,"Chanel");
  assert.ok(cluster.inspiration.includes("Eau de Parfum"));
  assert.ok(cluster.reference.includes("chanel.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="no-5"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-no-5-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-no-5-to-chanel-no-5")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-no-5-longevity")!.answer,/reliable hour range cannot/);
});

test("Omb Leather guides preserve Tom Ford EDP identity and evidence limits",()=>{
 assert.equal(OMB_LEATHER_GUIDES.length,15);
 for(const guide of OMB_LEATHER_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"ombre-leather");assert.equal(cluster.brand,"Tom Ford");
  assert.equal(cluster.inspiration,"Tom Ford Ombré Leather Eau de Parfum");
  assert.ok(cluster.reference.includes("tomfordbeauty.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="omb-leather"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-omb-leather-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-omb-leather-to-tom-ford-ombre-leather")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-omb-leather-longevity")!.answer,/reliable hour range cannot/);
});

test("Ombre Nomade guides preserve Louis Vuitton identity and evidence limits",()=>{
 assert.equal(OMBRE_NOMADE_GUIDES.length,15);
 for(const guide of OMBRE_NOMADE_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"ombre-nomade");assert.equal(cluster.brand,"Louis Vuitton");
  assert.equal(cluster.inspiration,"Louis Vuitton Ombre Nomade");
  assert.ok(cluster.reference.includes("louisvuitton.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="ombre-nomade"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-ombre-nomade-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-ombre-nomade-to-louis-vuitton-ombre-nomade")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-ombre-nomade-longevity")!.answer,/reliable hour range cannot/);
});

test("Oud Wood guides preserve Tom Ford EDP identity and evidence limits",()=>{
 assert.equal(OUD_WOOD_GUIDES.length,15);
 for(const guide of OUD_WOOD_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"oud-wood");assert.equal(cluster.brand,"Tom Ford");
  assert.equal(cluster.inspiration,"Tom Ford Oud Wood Eau de Parfum");
  assert.ok(cluster.reference.includes("tomfordbeauty.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="oud-wood"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-oud-wood-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-oud-wood-to-tom-ford-oud-wood")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-oud-wood-longevity")!.answer,/reliable hour range cannot/);
});

test("Red Tobacco guides preserve Mancera identity and evidence limits",()=>{
 assert.equal(RED_TOBACCO_GUIDES.length,15);
 for(const guide of RED_TOBACCO_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"red-tobacco");assert.equal(cluster.brand,"Mancera");
  assert.equal(cluster.inspiration,"Mancera Red Tobacco");
  assert.ok(cluster.reference.includes("manceraparfums.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="red-tobacco"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-red-tobacco-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-red-tobacco-to-mancera-red-tobacco")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-red-tobacco-longevity")!.answer,/reliable hour range cannot/);
});

test("Sauvage guides preserve Dior EDT identity and distinguish Elixir",()=>{
 assert.equal(SAUVAGE_GUIDES.length,15);
 for(const guide of SAUVAGE_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"sauvage-noir");assert.equal(cluster.brand,"Dior");
  assert.equal(cluster.inspiration,"Dior Sauvage Eau de Toilette");
  assert.ok(cluster.reference.includes("sauvage-eau-de-toilette"));
  assert.ok(cluster.guides.every(item=>item.cluster==="sauvage"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-sauvage-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-sauvage-to-dior-sauvage")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-sauvage-longevity")!.answer,/reliable hour range cannot/);
 assert.match(getPerfumeGuide("dior-sauvage-dupe-india")!.sections[0].answer,/Elixir is a separate product/);
});

test("SRK Special guides separate chosen inspiration from celebrity confirmation",()=>{
 assert.equal(SRK_SPECIAL_GUIDES.length,15);
 for(const guide of SRK_SPECIAL_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"srk-special");
  assert.equal(cluster.inspiration,"Diptyque Tam Dao + Dunhill Icon");
  assert.ok(cluster.guides.every(item=>item.cluster==="srk-special"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("what-perfume-does-shah-rukh-khan-use")!.answer,/without identifying the exact variants/);
 assert.match(getPerfumeGuide("what-perfume-does-shah-rukh-khan-use")!.answer,/no celebrity endorsement/);
 assert.match(getPerfumeGuide("hume-srk-special-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-srk-special-to-tam-dao-dunhill-icon")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-srk-special-longevity")!.answer,/reliable hour range cannot/);
});

test("Terre de Hermes guides preserve Hermès EDT identity and evidence limits",()=>{
 assert.equal(TERRE_DE_HERMES_GUIDES.length,15);
 for(const guide of TERRE_DE_HERMES_GUIDES){
  const cluster=getGuideCluster(getPerfumeGuide(guide.slug)!);
  assert.equal(cluster.productId,"terre-de-hermes");assert.equal(cluster.brand,"Hermès");
  assert.equal(cluster.inspiration,"Hermès Terre d’Hermès Eau de Toilette");
  assert.ok(cluster.reference.includes("hermes.com"));
  assert.ok(cluster.guides.every(item=>item.cluster==="terre-de-hermes"));
  assert.ok(guide.sections.every(section=>section.question.endsWith("?")));
 }
 assert.match(getPerfumeGuide("hume-terre-de-hermes-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-terre-de-hermes-to-hermes-terre-d-hermes")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-terre-de-hermes-longevity")!.answer,/reliable hour range cannot/);
});

test("The Blue guides use the existing product without assigning an unverified edition",()=>{
 assert.equal(THE_BLUE_GUIDES.length,15);
 for(const guide of THE_BLUE_GUIDES){const cluster=getGuideCluster(guide);assert.equal(cluster.productId,"bleu-de-chanel");assert.equal(cluster.inspiration,"Chanel Bleu de Chanel");assert.ok(cluster.guides.every(item=>item.cluster==="the-blue"));}
 assert.match(getPerfumeGuide("hume-the-blue-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-the-blue-to-bleu-de-chanel")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-the-blue-longevity")!.answer,/reliable hour range cannot/);
});

test("Viking Spirit guides resolve to original Viking and retain evidence limits",()=>{
 assert.equal(VIKING_SPIRIT_GUIDES.length,15);
 for(const guide of VIKING_SPIRIT_GUIDES){const cluster=getGuideCluster(guide);assert.equal(cluster.productId,"creed-viking");assert.equal(cluster.inspiration,"Creed Viking");assert.ok(cluster.guides.every(item=>item.cluster==="viking-spirit"));}
 assert.match(getPerfumeGuide("hume-viking-spirit-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-viking-spirit-to-creed-viking")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-viking-spirit-longevity")!.answer,/reliable hour range cannot/);
});

test("Y EDP guides resolve to YSL Y Eau de Parfum and retain evidence limits",()=>{
 assert.equal(Y_EDP_GUIDES.length,15);
 for(const guide of Y_EDP_GUIDES){const cluster=getGuideCluster(guide);assert.equal(cluster.productId,"ysl-y-edp");assert.equal(cluster.inspiration,"YSL Y Eau de Parfum");assert.ok(cluster.guides.every(item=>item.cluster==="y-edp"));}
 assert.match(getPerfumeGuide("hume-y-edp-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-y-edp-to-ysl-y-edp")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-y-edp-longevity")!.answer,/reliable hour range cannot/);
});

test("1 Million guides resolve to Rabanne EDT and retain evidence limits",()=>{
 assert.equal(ONE_MILLION_GUIDES.length,15);
 for(const guide of ONE_MILLION_GUIDES){const cluster=getGuideCluster(guide);assert.equal(cluster.productId,"1-million");assert.equal(cluster.inspiration,"Rabanne 1 Million Eau de Toilette");assert.ok(cluster.guides.every(item=>item.cluster==="1-million"));}
 assert.match(getPerfumeGuide("hume-1-million-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-1-million-to-rabanne-1-million")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-1-million-longevity")!.answer,/reliable hour range cannot/);
});

test("Althair guides preserve original Althaïr identity and evidence limits",()=>{
 assert.equal(ALTHAIR_GUIDES.length,15);
 for(const guide of ALTHAIR_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"althair");assert.equal(c.brand,"Parfums de Marly");assert.ok(c.guides.every(g=>g.cluster==="althair"));assert.doesNotMatch(JSON.stringify(guide),/Rabanne|1 Million|leathery|Sauvage/);}
 assert.match(getPerfumeGuide("hume-althair-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-althair-to-parfums-de-marly-althair")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-althair-longevity")!.answer,/reliable hour range cannot/);
});

test("Angels Share guides preserve Kilian identity and evidence limits",()=>{
 assert.equal(ANGELS_SHARE_GUIDES.length,15);
 for(const guide of ANGELS_SHARE_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"angels-share");assert.equal(c.brand,"Kilian");assert.ok(c.guides.every(g=>g.cluster==="angels-share"));assert.doesNotMatch(JSON.stringify(guide),/Althaïr|Parfums de Marly|Exclusif|orange blossom/);}
 assert.match(getPerfumeGuide("hume-angels-share-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-angels-share-to-kilian-angels-share")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-angels-share-longevity")!.answer,/reliable hour range cannot/);
});

test("Bright Crystal guides preserve original Versace EDT identity",()=>{
 assert.equal(BRIGHT_CRYSTAL_GUIDES.length,15);
 for(const guide of BRIGHT_CRYSTAL_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"bright-crystal");assert.equal(c.inspiration,"Versace Bright Crystal Eau de Toilette");assert.ok(c.guides.every(g=>g.cluster==="bright-crystal"));assert.doesNotMatch(JSON.stringify(guide),/Kilian|cognac|praline|sweet-spicy|gourmand-woods/);}
 assert.match(getPerfumeGuide("hume-bright-crystal-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-bright-crystal-to-versace-bright-crystal")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-bright-crystal-longevity")!.answer,/reliable hour range cannot/);
});

test("Eros guides preserve Versace EDP identity and evidence limits",()=>{
 assert.equal(EROS_GUIDES.length,15);
 for(const guide of EROS_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"eros");assert.equal(c.inspiration,"Versace Eros Eau de Parfum");assert.ok(c.guides.every(g=>g.cluster==="eros"));assert.doesNotMatch(JSON.stringify(guide),/Rabanne|1 Million Eau|cinnamon|leathery/);}
 assert.match(getPerfumeGuide("hume-eros-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-eros-to-versace-eros-edp")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-eros-longevity")!.answer,/reliable hour range cannot/);
});

test("Goddess guides preserve original Burberry EDP identity",()=>{
 assert.equal(GODDESS_GUIDES.length,15);
 for(const guide of GODDESS_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"goddess");assert.equal(c.inspiration,"Burberry Goddess Eau de Parfum");assert.ok(c.guides.every(g=>g.cluster==="goddess"));assert.doesNotMatch(JSON.stringify(guide),/Parfums de Marly|Althaïr|praline|orange blossom|Exclusif/);}
 assert.match(getPerfumeGuide("hume-goddess-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-goddess-to-burberry-goddess-edp")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-goddess-longevity")!.answer,/reliable hour range cannot/);
});

test("Her guides preserve original Burberry EDP identity",()=>{
 assert.equal(HER_GUIDES.length,15);
 for(const guide of HER_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"her");assert.equal(c.inspiration,"Burberry Her Eau de Parfum");assert.ok(c.guides.every(g=>g.cluster==="her"));assert.doesNotMatch(JSON.stringify(guide),/Versace|yuzu|pomegranate|peony|magnolia|lotus|Absolu/);}
 assert.match(getPerfumeGuide("hume-her-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-her-to-burberry-her-edp")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-her-longevity")!.answer,/reliable hour range cannot/);
});

test("Hugo Boss Man guides resolve to HUGO Man EDT",()=>{
 assert.equal(HUGO_BOSS_MAN_GUIDES.length,15);
 for(const guide of HUGO_BOSS_MAN_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"hugo-boss");assert.equal(c.inspiration,"HUGO Man Eau de Toilette");assert.ok(c.guides.every(g=>g.cluster==="hugo-boss-man"));assert.doesNotMatch(JSON.stringify(guide),/Versace|yuzu|pomegranate|peony|magnolia|lotus|Absolu/);}
 assert.match(getPerfumeGuide("hume-hugo-boss-man-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-hugo-boss-man-to-hugo-man")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-hugo-boss-man-longevity")!.answer,/reliable hour range cannot/);
});

test("Invictus guides preserve original Rabanne EDT identity",()=>{
 assert.equal(INVICTUS_GUIDES.length,15);
 for(const guide of INVICTUS_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"invictus");assert.equal(c.inspiration,"Rabanne Invictus Eau de Toilette");assert.ok(c.guides.every(g=>g.cluster==="invictus"));assert.doesNotMatch(JSON.stringify(guide),/Hugo|HUGO|BOSS|apple|fir.balsam/);}
 assert.match(getPerfumeGuide("hume-invictus-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-invictus-to-rabanne-invictus-edt")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-invictus-longevity")!.answer,/reliable hour range cannot/);
});

test("Jadore guides preserve Dior EDP identity",()=>{
 assert.equal(JADORE_GUIDES.length,15);
 for(const guide of JADORE_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"jadore");assert.equal(c.inspiration,"Dior J’adore Eau de Parfum");assert.ok(c.guides.every(g=>g.cluster==="jadore"));assert.doesNotMatch(JSON.stringify(guide),/Burberry|Her Elixir|berry|creamy amber|violet/);}
 assert.match(getPerfumeGuide("hume-jadore-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-jadore-to-dior-jadore-edp")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-jadore-longevity")!.answer,/reliable hour range cannot/);
});

test("La Nuit guides preserve YSL EDT identity",()=>{
 assert.equal(LA_NUIT_GUIDES.length,15);
 for(const guide of LA_NUIT_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"la-nuit");assert.equal(c.inspiration,"YSL La Nuit de L’Homme Eau de Toilette");assert.ok(c.guides.every(g=>g.cluster==="la-nuit"));assert.doesNotMatch(JSON.stringify(guide),/Hugo|HUGO|BOSS|apple|fir.balsam/);}
 assert.match(getPerfumeGuide("hume-la-nuit-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-la-nuit-to-ysl-la-nuit-de-l-homme-edt")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-la-nuit-longevity")!.answer,/reliable hour range cannot/);
});

test("Most Wanted guides preserve Azzaro Parfum identity",()=>{
 assert.equal(MOST_WANTED_GUIDES.length,15);
 for(const guide of MOST_WANTED_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"most-wanted");assert.equal(c.inspiration,"Azzaro The Most Wanted Parfum");assert.ok(c.guides.every(g=>g.cluster==="most-wanted"));assert.doesNotMatch(JSON.stringify(guide),/Parfums de Marly|Althaïr|praline|orange blossom|Exclusif/);}
 assert.match(getPerfumeGuide("hume-most-wanted-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-most-wanted-to-azzaro-the-most-wanted-parfum")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-most-wanted-longevity")!.answer,/reliable hour range cannot/);
});

test("Night Out guides preserve distinct Afnan inspiration",()=>{
 assert.equal(NIGHT_OUT_GUIDES.length,15);
 for(const guide of NIGHT_OUT_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"night-out");assert.equal(c.inspiration,"Afnan 9 PM Night Out");assert.ok(c.guides.every(g=>g.cluster==="night-out"));assert.doesNotMatch(JSON.stringify(guide),/Azzaro|Bourbon|red ginger|EDP Intense/);}
 assert.match(getPerfumeGuide("hume-night-out-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-night-out-to-afnan-9pm-night-out")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-night-out-longevity")!.answer,/reliable hour range cannot/);
});

test("Noir Extreme guides preserve Tom Ford EDP identity",()=>{
 assert.equal(NOIR_EXTREME_GUIDES.length,15);
 for(const guide of NOIR_EXTREME_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"noir-extreme");assert.equal(c.inspiration,"Tom Ford Noir Extreme Eau de Parfum");assert.ok(c.guides.every(g=>g.cluster==="noir-extreme"));assert.doesNotMatch(JSON.stringify(guide),/Parfums de Marly|Althaïr|praline|Exclusif/);}
 assert.match(getPerfumeGuide("hume-noir-extreme-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-noir-extreme-to-tom-ford-noir-extreme-edp")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-noir-extreme-longevity")!.answer,/reliable hour range cannot/);
});

test("Pacific Chill guides preserve Louis Vuitton identity",()=>{
 assert.equal(PACIFIC_CHILL_GUIDES.length,15);
 for(const guide of PACIFIC_CHILL_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"pacific-chill");assert.equal(c.inspiration,"Louis Vuitton Pacific Chill");assert.ok(c.guides.every(g=>g.cluster==="pacific-chill"));assert.doesNotMatch(JSON.stringify(guide),/Hugo|HUGO|BOSS|apple|fir.balsam/);}
 assert.match(getPerfumeGuide("hume-pacific-chill-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-pacific-chill-to-louis-vuitton-pacific-chill")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-pacific-chill-longevity")!.answer,/reliable hour range cannot/);
});

test("Tobacco Vanille guides preserve Tom Ford EDP identity",()=>{
 assert.equal(TOBACCO_VANILLE_GUIDES.length,15);
 for(const guide of TOBACCO_VANILLE_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"tobacco-vanille");assert.equal(c.inspiration,"Tom Ford Tobacco Vanille Eau de Parfum");assert.ok(c.guides.every(g=>g.cluster==="tobacco-vanille"));assert.doesNotMatch(JSON.stringify(guide),/kulfi|neroli|saffron|Noir Extreme Eau/);}
 assert.match(getPerfumeGuide("hume-tobacco-vanille-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-tobacco-vanille-to-tom-ford-tobacco-vanille")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-tobacco-vanille-longevity")!.answer,/reliable hour range cannot/);
});

test("Allure Sport guides preserve Chanel identity",()=>{
 assert.equal(ALLURE_SPORT_GUIDES.length,15);
 for(const guide of ALLURE_SPORT_GUIDES){const c=getGuideCluster(guide);assert.equal(c.productId,"allure-sport");assert.equal(c.inspiration,"Chanel Allure Homme Sport");assert.ok(c.guides.every(g=>g.cluster==="allure-sport"));assert.doesNotMatch(JSON.stringify(guide),/Hugo|HUGO|BOSS|apple|fir.balsam/);}
 assert.match(getPerfumeGuide("hume-allure-sport-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("how-close-hume-allure-sport-to-chanel-allure-homme-sport")!.answer,/not a measured similarity/);
 assert.match(getPerfumeGuide("hume-allure-sport-longevity")!.answer,/reliable hour range cannot/);
});

test("BR 540 guides preserve MFK identity and edition uncertainty",()=>{
 assert.equal(BR_540_GUIDES.length,15);
 for(const guide of BR_540_GUIDES){assert.equal(getGuideCluster(guide).productId,"br-540");assert.equal(getGuideCluster(guide).inspiration,"Maison Francis Kurkdjian Baccarat Rouge 540");assert.doesNotMatch(JSON.stringify(guide),/Chanel|mandarin|Allure/);}
 assert.match(getPerfumeGuide("hume-br-540-vs-mfk-baccarat-rouge-540")!.sections[0].answer,/does not confirm/);
 assert.match(getPerfumeGuide("hume-br-540-review")!.answer,/not an independent/);
 assert.equal(new Set(PERFUME_GUIDES.map(g=>g.slug)).size,PERFUME_GUIDES.length);
});



test("Guilty Pour Homme guides use the existing Gucci-inspired product",()=>{
 assert.equal(GUILTY_POUR_HOMME_GUIDES.length,15);
 for(const g of GUILTY_POUR_HOMME_GUIDES){assert.equal(getGuideCluster(g).productId,"guilty-homme");assert.doesNotMatch(JSON.stringify(g),/Chanel|Allure|mandarin|sporty|Marine/);}
 assert.match(getPerfumeGuide("hume-guilty-pour-homme-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("hume-guilty-pour-homme-longevity")!.answer,/reliable hour range cannot/);
});

test("Hawas Ice guides resolve separately from classic Hawas",()=>{
 assert.equal(HAWAS_ICE_GUIDES.length,15);
 for(const g of HAWAS_ICE_GUIDES){assert.equal(getGuideCluster(g).productId,"hawas-ice");assert.equal(getGuideCluster(g).inspiration,"Rasasi Hawas Ice");assert.doesNotMatch(JSON.stringify(g),/Chanel|Allure|mandarin|Eau Extrême/);}
 assert.match(getPerfumeGuide("rasasi-hawas-ice-dupe-india")!.sections[0].answer,/separate flanker/);
 assert.match(getPerfumeGuide("hume-hawas-ice-review")!.answer,/not an independent/);
});

test("Homme Intense guides preserve Dior Intense identity",()=>{
 assert.equal(HOMME_INTENSE_GUIDES.length,15);
 for(const g of HOMME_INTENSE_GUIDES){assert.equal(getGuideCluster(g).productId,"homme-intense");assert.equal(getGuideCluster(g).inspiration,"Dior Homme Intense");assert.doesNotMatch(JSON.stringify(g),/Chanel|Allure|mandarin|Eau Extrême|Sporty/);}
 assert.match(getPerfumeGuide("hume-homme-intense-review")!.answer,/not an independent/);
 assert.match(getPerfumeGuide("dior-homme-intense-dupe-india")!.sections[0].answer,/distinct references/);
});

test("Jazz Club guides resolve to the existing REPLICA-inspired product",()=>{
 assert.equal(JAZZ_CLUB_GUIDES.length,15);
 for(const g of JAZZ_CLUB_GUIDES){assert.equal(getGuideCluster(g).productId,"replica-jazz-club-100ml");assert.equal(getGuideCluster(g).inspiration,"Maison Margiela REPLICA Jazz Club");assert.doesNotMatch(JSON.stringify(g),/MFK|Baccarat|saffron|almond|Extrait/);}
 assert.match(getPerfumeGuide("hume-jazz-club-review")!.answer,/not an independent/);
});

test("Libre Intense guides preserve YSL Intense identity",()=>{
 assert.equal(LIBRE_INTENSE_GUIDES.length,15);
 for(const g of LIBRE_INTENSE_GUIDES){assert.equal(getGuideCluster(g).productId,"libre-intense");assert.equal(getGuideCluster(g).inspiration,"YSL Libre Intense");assert.doesNotMatch(JSON.stringify(g),/MFK|Baccarat|saffron|almond|Extrait/);}
 assert.match(getPerfumeGuide("hume-libre-intense-review")!.answer,/not an independent/);
});

test("Myself guides preserve YSL MYSLF identity and edition limits",()=>{
 assert.equal(MYSELF_GUIDES.length,15);
 for(const g of MYSELF_GUIDES){assert.equal(getGuideCluster(g).productId,"myself");assert.equal(getGuideCluster(g).inspiration,"YSL MYSLF");assert.doesNotMatch(JSON.stringify(g),/Libre|lavender|orchid|MFK|Baccarat/);}
 assert.match(getPerfumeGuide("hume-myself-review")!.answer,/not an independent/);
});

test("Oud Maracuja guides preserve Maison Crivelli identity",()=>{
 assert.equal(OUD_MARACUJA_GUIDES.length,15);
 for(const g of OUD_MARACUJA_GUIDES){assert.equal(getGuideCluster(g).productId,"oud-maracuja");assert.equal(getGuideCluster(g).inspiration,"Maison Crivelli Oud Maracuja");assert.doesNotMatch(JSON.stringify(g),/MFK|Baccarat|almond|jasmine|Pure Perfume/);}
 assert.match(getPerfumeGuide("hume-oud-maracuja-review")!.answer,/not an independent/);
});

test("Paradoxe guides preserve the original Prada identity",()=>{
 assert.equal(PARADOXE_GUIDES.length,15);
 for(const g of PARADOXE_GUIDES){assert.equal(getGuideCluster(g).productId,"paradoxe");assert.equal(getGuideCluster(g).inspiration,"Prada Paradoxe");assert.doesNotMatch(g.answer,/YSL|lavender|orchid|Baccarat/);}
 assert.match(getPerfumeGuide("hume-paradoxe-review")!.answer,/not an independent/);
});

test("Roma Intense guides resolve to Valentino with explicit Uomo context",()=>{
 assert.equal(ROMA_INTENSE_GUIDES.length,15);
 for(const g of ROMA_INTENSE_GUIDES){assert.equal(getGuideCluster(g).productId,"valentino-born-in-roma-intense");assert.doesNotMatch(JSON.stringify(g),/YSL|Libre|orchid|orange blossom/);}
 assert.match(getPerfumeGuide("hume-roma-intense-review")!.answer,/not an independent/);
});

test("Sauvage Elixir guides resolve separately from Sauvage",()=>{
 assert.equal(SAUVAGE_ELIXIR_GUIDES.length,15);
 for(const g of SAUVAGE_ELIXIR_GUIDES){assert.equal(getGuideCluster(g).productId,"sauvage-elixir");assert.doesNotMatch(JSON.stringify(g),/Valentino|Roma|Uomo|Donna|vanilla/);}
 assert.match(getPerfumeGuide("hume-sauvage-elixir-review")!.answer,/not an independent/);
});

test("Spice Inferno guides preserve original Spicebomb identity",()=>{
 assert.equal(SPICE_INFERNO_GUIDES.length,15);
 for(const g of SPICE_INFERNO_GUIDES){assert.equal(getGuideCluster(g).productId,"spicebomb");assert.doesNotMatch(g.answer,/Dior|lavender|licorice/);}
 assert.match(getPerfumeGuide("hume-spice-inferno-review")!.answer,/not an independent/);
});

test("Flora guides preserve Gucci identity and edition uncertainty",()=>{
 assert.equal(FLORA_GUIDES.length,15);
 for(const g of FLORA_GUIDES){assert.equal(getGuideCluster(g).productId,"flora");assert.doesNotMatch(g.answer,/Prada|Paradoxe|neroli|lavender/);}
 assert.match(getPerfumeGuide("hume-flora-review")!.answer,/not an independent/);
});
