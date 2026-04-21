-- Bulk import/update reviews from hume_reviews.json
-- Generated automatically
begin;

-- Optional: inspect slugs that are missing in products table
with input_slugs(slug) as (
  values
  ('acqua-di-gio-profondo'),
  ('bleu-de-chanel'),
  ('creed-aventus'),
  ('creed-viking'),
  ('good-girl'),
  ('gypsy-water'),
  ('hawas'),
  ('homme-intense'),
  ('lattafa-khamrah-qahwa-100ml'),
  ('lv-imagination'),
  ('myself'),
  ('ombre-leather'),
  ('ombre-nomade'),
  ('oud-wood'),
  ('replica-jazz-club-100ml'),
  ('sauvage-noir'),
  ('spicebomb'),
  ('srk-special'),
  ('stronger-with-you-intensely'),
  ('terre-de-hermes'),
  ('ultra-male'),
  ('valentino-born-in-roma-intense'),
  ('ysl-y-edp')
)
select s.slug as missing_product_id
from input_slugs s
left join products p on p.id = s.slug
where p.id is null;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'sauvage-001', 'sauvage-noir', 'Prithvi T', null, 'Jaipur', 'en-IN',
  5, '2026-04-05', 'Review by Prithvi T', 'Best thing I bought this Indian summer. Step out of the shower, spray this on, and you smell like a million rupees all day. Unreal freshness.', true
where exists (select 1 from products p where p.id = 'sauvage-noir')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'sauvage-002', 'sauvage-noir', 'Karan M', null, 'Chandigarh', 'en-IN',
  5, '2026-04-05', 'Review by Karan M', 'Wore this to a wedding and got compliments from literally every uncle-aunty there. The longevity in humid Punjab heat is insane.', true
where exists (select 1 from products p where p.id = 'sauvage-noir')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'sauvage-003', 'sauvage-noir', 'Rohan V', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Rohan V', 'My go-to for office. Not overpowering, never gives headache, just clean and masculine. Worth every paisa.', true
where exists (select 1 from products p where p.id = 'sauvage-noir')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'sauvage-004', 'sauvage-noir', 'Aditi S', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Aditi S', 'Bought this for my brother and he called me the best sister ever. Smells exactly like I imagined â€“ fresh, sharp, premium.', true
where exists (select 1 from products p where p.id = 'sauvage-noir')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'sauvage-005', 'sauvage-noir', 'Nikhil R', null, 'Hyderabad', 'en-IN',
  4, '2026-04-05', 'Review by Nikhil R', 'Very close to the original. Projection is excellent, lasts through a full day of work. Ordering my second bottle.', true
where exists (select 1 from products p where p.id = 'sauvage-noir')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'swyi-001', 'stronger-with-you-intensely', 'Saloni S', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Saloni S', 'Bought this for my boyfriend and I absolutely love it when he wears it. Warm, sweet, and so cozy. It makes me want to hug him all day.', true
where exists (select 1 from products p where p.id = 'stronger-with-you-intensely')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'swyi-002', 'stronger-with-you-intensely', 'Arjun K', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Arjun K', 'Winter evenings in Delhi just hit different with this on. The vanilla and wood combo is exactly what the cold weather needs.', true
where exists (select 1 from products p where p.id = 'stronger-with-you-intensely')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'swyi-003', 'stronger-with-you-intensely', 'Meghna P', null, 'Surat', 'en-IN',
  5, '2026-04-05', 'Review by Meghna P', 'Gifted this to my husband on his birthday. He has gotten more compliments in one week than all his previous perfumes combined.', true
where exists (select 1 from products p where p.id = 'stronger-with-you-intensely')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'swyi-004', 'stronger-with-you-intensely', 'Siddharth J', null, 'Ahmedabad', 'en-IN',
  4, '2026-04-05', 'Review by Siddharth J', 'Sweet but not sickly. Perfect for dates and evenings out. The bottle design is also really elegant.', true
where exists (select 1 from products p where p.id = 'stronger-with-you-intensely')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'swyi-005', 'stronger-with-you-intensely', 'Pooja N', null, 'Nagpur', 'en-IN',
  5, '2026-04-05', 'Review by Pooja N', 'The warmth in this scent is unreal. My husband refuses to wear anything else now. Reordering next month for sure.', true
where exists (select 1 from products p where p.id = 'stronger-with-you-intensely')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aventus-001', 'creed-aventus', 'Vikram S', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Vikram S', 'This is the king. Wore this to my client meeting and the client literally stopped mid-sentence to ask what I was wearing. Confidence in a bottle.', true
where exists (select 1 from products p where p.id = 'creed-aventus')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aventus-002', 'creed-aventus', 'Radhika T', null, 'Chennai', 'en-IN',
  5, '2026-04-05', 'Review by Radhika T', 'My husband smells like he just walked off a yacht. In Chennai heat, this stays with him for hours. Absolutely worth it.', true
where exists (select 1 from products p where p.id = 'creed-aventus')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aventus-003', 'creed-aventus', 'Aakash G', null, 'Kolkata', 'en-IN',
  5, '2026-04-05', 'Review by Aakash G', 'Been hunting for a good Aventus dupe for years. Finally found it. The pineapple opening is spot on and the drydown is gorgeous.', true
where exists (select 1 from products p where p.id = 'creed-aventus')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aventus-004', 'creed-aventus', 'Riya M', null, 'Noida', 'en-IN',
  5, '2026-04-05', 'Review by Riya M', 'Bought it for my dad and now I have to hide it or he sprays it every single day. That fruity smoky combo is so addictive.', true
where exists (select 1 from products p where p.id = 'creed-aventus')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aventus-005', 'creed-aventus', 'Prashanth K', null, 'Bengaluru', 'en-IN',
  4, '2026-04-05', 'Review by Prashanth K', 'Smells premium, performs premium. In the Bengaluru weather it lasts easily 8+ hours. My office colleagues started asking questions.', true
where exists (select 1 from products p where p.id = 'creed-aventus')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'bdc-001', 'bleu-de-chanel', 'Deepak R', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Deepak R', 'This is sophistication in a bottle. Clean, woody, never too heavy. My wife stopped me at the door just to smell me again before I left for work.', true
where exists (select 1 from products p where p.id = 'bleu-de-chanel')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'bdc-002', 'bleu-de-chanel', 'Nishka B', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Nishka B', 'Got this for my fiancÃ© as a pre-wedding gift. He wore it at the engagement and EVERYONE asked which perfume it was. Best decision ever.', true
where exists (select 1 from products p where p.id = 'bleu-de-chanel')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'bdc-003', 'bleu-de-chanel', 'Rahul A', null, 'Lucknow', 'en-IN',
  5, '2026-04-05', 'Review by Rahul A', 'The transition from citrus to woody is so smooth. This is my daily driver now. Everyday luxury without breaking the bank.', true
where exists (select 1 from products p where p.id = 'bleu-de-chanel')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'bdc-004', 'bleu-de-chanel', 'Sneha V', null, 'Pune', 'en-IN',
  4, '2026-04-05', 'Review by Sneha V', 'My boyfriend smells like a different man with this on. Very French, very elegant. I am definitely reordering.', true
where exists (select 1 from products p where p.id = 'bleu-de-chanel')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'nomade-001', 'ombre-nomade', 'Fatima Z', null, 'Hyderabad', 'en-IN',
  5, '2026-04-05', 'Review by Fatima Z', 'This is the most luxurious oud I have ever smelled at this price point. Perfect for Eid, weddings, any special occasion. Mashallah on the quality.', true
where exists (select 1 from products p where p.id = 'ombre-nomade')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'nomade-002', 'ombre-nomade', 'Syed A', null, 'Lucknow', 'en-IN',
  5, '2026-04-05', 'Review by Syed A', 'Smoky, woody, and absolutely magnificent. In UP winters this just wraps around you like a shawl. Highly recommend for anyone who loves traditional attar-style fragrances.', true
where exists (select 1 from products p where p.id = 'ombre-nomade')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'nomade-003', 'ombre-nomade', 'Priya N', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Priya N', 'Wore this to a Diwali pooja and every aunty complimented me on the fragrance. The rose and oud combination is divine.', true
where exists (select 1 from products p where p.id = 'ombre-nomade')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'nomade-004', 'ombre-nomade', 'Roshan K', null, 'Kochi', 'en-IN',
  5, '2026-04-05', 'Review by Roshan K', 'I was skeptical about ordering online but this blew my mind. Genuinely indistinguishable from the original. Beast mode projection.', true
where exists (select 1 from products p where p.id = 'ombre-nomade')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'nomade-005', 'ombre-nomade', 'Zara H', null, 'Bhopal', 'en-IN',
  5, '2026-04-05', 'Review by Zara H', 'This is my signature now. Every time I enter a room people notice. Romantic, opulent, and lasts all day even in summer.', true
where exists (select 1 from products p where p.id = 'ombre-nomade')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'oudwood-001', 'oud-wood', 'Akshay M', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Akshay M', 'Dry, woody, and impossibly smooth. This is the kind of fragrance that makes people think you spent a fortune at Harrods. Effortlessly classy.', true
where exists (select 1 from products p where p.id = 'oud-wood')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'oudwood-002', 'oud-wood', 'Divya S', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Divya S', 'Bought it for my dad''s retirement and he wore it to every family function since. It has become his signature and everyone associates it with him now.', true
where exists (select 1 from products p where p.id = 'oud-wood')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'oudwood-003', 'oud-wood', 'Rishav T', null, 'Guwahati', 'en-IN',
  5, '2026-04-05', 'Review by Rishav T', 'The smoky spice with sandalwood drydown is perfect for North East winters. Lasts from morning pooja to evening dinner. Amazing quality.', true
where exists (select 1 from products p where p.id = 'oud-wood')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'oudwood-004', 'oud-wood', 'Neha C', null, 'Jaipur', 'en-IN',
  4, '2026-04-05', 'Review by Neha C', 'Gifted to my husband. He''s usually very picky about scents but immediately said ''this is different, this is good.'' That says everything.', true
where exists (select 1 from products p where p.id = 'oud-wood')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'jazz-001', 'replica-jazz-club-100ml', 'Aryan D', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Aryan D', 'This is pure jazz in olfactive form. Smoky rum, tobacco, warm vanilla. Wore this to a rooftop party and it set the perfect mood all night.', true
where exists (select 1 from products p where p.id = 'replica-jazz-club-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'jazz-002', 'replica-jazz-club-100ml', 'Simran K', null, 'Chandigarh', 'en-IN',
  5, '2026-04-05', 'Review by Simran K', 'My brother wears this and I always know when he''s home before I see him. That tobacco-rum combination is intoxicating in the best possible way.', true
where exists (select 1 from products p where p.id = 'replica-jazz-club-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'jazz-003', 'replica-jazz-club-100ml', 'Kunal B', null, 'Kolkata', 'en-IN',
  5, '2026-04-05', 'Review by Kunal B', 'Evening fragrance done right. This replaced my old bottle of Black Orchid for evenings. Dark, warm, mysterious. Kolkata nights feel cinematic in this.', true
where exists (select 1 from products p where p.id = 'replica-jazz-club-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'jazz-004', 'replica-jazz-club-100ml', 'Mansi R', null, 'Vadodara', 'en-IN',
  4, '2026-04-05', 'Review by Mansi R', 'Got this as a gift suggestion for my boyfriend. He looked confused when I said ''jazz club'' but then smelled it and ordered two bottles.', true
where exists (select 1 from products p where p.id = 'replica-jazz-club-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'leather-001', 'ombre-leather', 'Kabir S', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Kabir S', 'Raw, bold, and commanding. This is exactly what I wear when I need to feel like I own every room I walk into. The leather note is incredibly authentic.', true
where exists (select 1 from products p where p.id = 'ombre-leather')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'leather-002', 'ombre-leather', 'Tanvi R', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Tanvi R', 'I wear this myself â€“ not just for men! The leather and florals combination is so bold and confident. Perfect for women who don''t want to smell like a flower market.', true
where exists (select 1 from products p where p.id = 'ombre-leather')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'leather-003', 'ombre-leather', 'Varun M', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Varun M', 'The floral heart surprised me but then the leather comes through strong in the drydown. Lasts easily 10 hours on my skin. Absolutely love it.', true
where exists (select 1 from products p where p.id = 'ombre-leather')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'leather-004', 'ombre-leather', 'Aarohi T', null, 'Ahmedabad', 'en-IN',
  5, '2026-04-05', 'Review by Aarohi T', 'Gifted to my dad on Father''s Day. He called it ''the best gift I have ever received.'' That made my whole year.', true
where exists (select 1 from products p where p.id = 'ombre-leather')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'viking-001', 'creed-viking', 'Abhinav R', null, 'Chandigarh', 'en-IN',
  5, '2026-04-05', 'Review by Abhinav R', 'Fresh, sharp, and absolutely powerful. I wore this trekking in Himachal and it survived the entire 8-hour trail with projection still going strong. Beast.', true
where exists (select 1 from products p where p.id = 'creed-viking')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'viking-002', 'creed-viking', 'Shubham G', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Shubham G', 'This smells expensive in a way that is hard to explain. Fresh citrus then deep woods then spice. The progression is beautiful. Multiple compliments every day.', true
where exists (select 1 from products p where p.id = 'creed-viking')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'viking-003', 'creed-viking', 'Kavya N', null, 'Bengaluru', 'en-IN',
  4, '2026-04-05', 'Review by Kavya N', 'Bought for my brother''s birthday. The box and bottle look so premium. He almost didn''t believe the price. Smells like it should cost much more.', true
where exists (select 1 from products p where p.id = 'creed-viking')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'viking-004', 'creed-viking', 'Tarun S', null, 'Lucknow', 'en-IN',
  5, '2026-04-05', 'Review by Tarun S', 'For Indian summers this is my secret weapon. Shower, spray, forget. Stays fresh all day without ever going sour. Brilliant.', true
where exists (select 1 from products p where p.id = 'creed-viking')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'goodgirl-001', 'good-girl', 'Ankita S', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Ankita S', 'The bottle is iconic and the scent even more so. Jasmine, tonka, vanilla â€“ this is everything a date-night fragrance should be. Absolutely magnetic.', true
where exists (select 1 from products p where p.id = 'good-girl')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'goodgirl-002', 'good-girl', 'Mahi V', null, 'Jaipur', 'en-IN',
  5, '2026-04-05', 'Review by Mahi V', 'This was my birthday present to myself and it''s the best decision I made all year. The compliments I get at college are unbelievable. Everyone asks what I''m wearing.', true
where exists (select 1 from products p where p.id = 'good-girl')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'goodgirl-003', 'good-girl', 'Payal T', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Payal T', 'Dark, floral, mysterious, and feminine. I spray this before going out and I feel like a completely different person. Confidence booster in 2 sprays.', true
where exists (select 1 from products p where p.id = 'good-girl')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'goodgirl-004', 'good-girl', 'Ranjit K', null, 'Ahmedabad', 'en-IN',
  5, '2026-04-05', 'Review by Ranjit K', 'Bought for my wife on our anniversary. She hasn''t worn anything else since. The silage is incredible. She walks by and the whole room smells amazing.', true
where exists (select 1 from products p where p.id = 'good-girl')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'goodgirl-005', 'good-girl', 'Ishita G', null, 'Delhi', 'en-IN',
  4, '2026-04-05', 'Review by Ishita G', 'Lasts well into the night on my skin which is unusual for Indian summer heat. Rich and addictive. The heel-shaped bottle is also just art.', true
where exists (select 1 from products p where p.id = 'good-girl')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'gypsy-001', 'gypsy-water', 'Shreya M', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Shreya M', 'This smells like pine forest and freedom. Every time I wear it I feel like I''m in the mountains. Perfect escape from the chaos of city life.', true
where exists (select 1 from products p where p.id = 'gypsy-water')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'gypsy-002', 'gypsy-water', 'Rohan P', null, 'Mumbai', 'en-IN',
  4, '2026-04-05', 'Review by Rohan P', 'Minimalist, fresh, and so well-blended. This is my ''creative work'' scent. Something about it makes me more focused. Unusual but brilliant.', true
where exists (select 1 from products p where p.id = 'gypsy-water')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'gypsy-003', 'gypsy-water', 'Aanya S', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Aanya S', 'The bergamot and incense combination is unlike anything else in my collection. Unisex done beautifully. I share this with my husband and we both love it.', true
where exists (select 1 from products p where p.id = 'gypsy-water')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'gypsy-004', 'gypsy-water', 'Kshitij B', null, 'Pune', 'en-IN',
  4, '2026-04-05', 'Review by Kshitij B', 'Received as a gift and initially wasn''t sure about the style. Two weeks later I''m halfway through the bottle. It''s discreet but deeply addictive.', true
where exists (select 1 from products p where p.id = 'gypsy-water')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'hawas-001', 'hawas', 'Suresh T', null, 'Hyderabad', 'en-IN',
  5, '2026-04-05', 'Review by Suresh T', 'Aquatic and masculine without being generic. Smells like the sea with a warm musky heart. In Hyderabad humidity this lasts impressively long.', true
where exists (select 1 from products p where p.id = 'hawas')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'hawas-002', 'hawas', 'Ananya P', null, 'Chennai', 'en-IN',
  5, '2026-04-05', 'Review by Ananya P', 'Got this for my fiancÃ©. He''s getting married next month and this will be his wedding day fragrance. Fresh and clean â€“ perfect for the summer wedding.', true
where exists (select 1 from products p where p.id = 'hawas')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'hawas-003', 'hawas', 'Madhav R', null, 'Kochi', 'en-IN',
  5, '2026-04-05', 'Review by Madhav R', 'Growing up near the Kerala backwaters I love aquatic scents. This captures that open-water freshness perfectly. My new everyday.', true
where exists (select 1 from products p where p.id = 'hawas')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'hawas-004', 'hawas', 'Ritika S', null, 'Jaipur', 'en-IN',
  4, '2026-04-05', 'Review by Ritika S', 'Smells genuinely expensive. The opening is bold then it softens into this beautiful clean musk. Great value. My boyfriend gets stopped on the street for it.', true
where exists (select 1 from products p where p.id = 'hawas')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'homme-001', 'homme-intense', 'Sameer J', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Sameer J', 'Dark iris, lavender, and incredible depth. I wore this on my first date with my now-wife. She still asks me to wear it on special occasions. 7 years later.', true
where exists (select 1 from products p where p.id = 'homme-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'homme-002', 'homme-intense', 'Prerna K', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Prerna K', 'My husband wears this to every important meeting. He swears it''s his lucky scent. Whether it is or not, he smells absolutely incredible. That''s enough.', true
where exists (select 1 from products p where p.id = 'homme-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'homme-003', 'homme-intense', 'Aditya M', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Aditya M', 'The powdery iris note is so unique â€“ not feminine, just refined and distinguished. Nothing like this in a mall fragrance. Feels genuinely niche.', true
where exists (select 1 from products p where p.id = 'homme-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'homme-004', 'homme-intense', 'Swati L', null, 'Lucknow', 'en-IN',
  5, '2026-04-05', 'Review by Swati L', 'Bought for my brother''s job interview. He got the job. He''s convinced it was the perfume. Ordered two more bottles for him since then.', true
where exists (select 1 from products p where p.id = 'homme-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'khamrah-001', 'lattafa-khamrah-qahwa-100ml', 'Amira K', null, 'Hyderabad', 'en-IN',
  5, '2026-04-05', 'Review by Amira K', 'This smells like the most luxurious Arabic coffee house mixed with the finest oud. For Ramadan evenings it is absolutely perfect. Divine.', true
where exists (select 1 from products p where p.id = 'lattafa-khamrah-qahwa-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'khamrah-002', 'lattafa-khamrah-qahwa-100ml', 'Farrukh A', null, 'Lucknow', 'en-IN',
  5, '2026-04-05', 'Review by Farrukh A', 'Extremely close to the original. Sweet, spicy, oriental in the best way. Lasts all day on my skin. The best value oriental I have found in India.', true
where exists (select 1 from products p where p.id = 'lattafa-khamrah-qahwa-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'khamrah-003', 'lattafa-khamrah-qahwa-100ml', 'Ruksana B', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Ruksana B', 'The coffee, cardamom and oud trio is intoxicating. I get stopped everywhere I go. Perfect for office parties and family gatherings.', true
where exists (select 1 from products p where p.id = 'lattafa-khamrah-qahwa-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'khamrah-004', 'lattafa-khamrah-qahwa-100ml', 'Zaid M', null, 'Delhi', 'en-IN',
  4, '2026-04-05', 'Review by Zaid M', 'Rich, warm, and deeply oriental. Indian winters are made for this. Three sprays and you''re set for 12 hours easily.', true
where exists (select 1 from products p where p.id = 'lattafa-khamrah-qahwa-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'khamrah-005', 'lattafa-khamrah-qahwa-100ml', 'Shaheen T', null, 'Bhopal', 'en-IN',
  5, '2026-04-05', 'Review by Shaheen T', 'My absolute favourite in the entire HUME collection. Gifted three bottles already. My whole family is now obsessed.', true
where exists (select 1 from products p where p.id = 'lattafa-khamrah-qahwa-100ml')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'imagine-001', 'lv-imagination', 'Dhruv P', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Dhruv P', 'Fresh citrus on top, warm leather underneath. This is exactly the kind of versatile fragrance you can wear from office straight to dinner. No compromise needed.', true
where exists (select 1 from products p where p.id = 'lv-imagination')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'imagine-002', 'lv-imagination', 'Nandita V', null, 'Bengaluru', 'en-IN',
  4, '2026-04-05', 'Review by Nandita V', 'Got for my husband who is very hard to please with fragrances. He loves this. Clean and layered and masculine without being aggressive.', true
where exists (select 1 from products p where p.id = 'lv-imagination')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'imagine-003', 'lv-imagination', 'Arnav S', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Arnav S', 'Something different about this one. Can''t fully describe it but it smells genuinely unique in my collection. Not sweet, not sharp, just perfectly balanced.', true
where exists (select 1 from products p where p.id = 'lv-imagination')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'imagine-004', 'lv-imagination', 'Rima C', null, 'Kolkata', 'en-IN',
  4, '2026-04-05', 'Review by Rima C', 'The bottle is beautiful and the scent matches. Feels like proper luxury. My brother loves it and he''s extremely picky about his fragrances.', true
where exists (select 1 from products p where p.id = 'lv-imagination')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'myself-001', 'myself', 'Rishabh K', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Rishabh K', 'This has become my signature scent. Something about the apple and woody base is just perfect for the modern young Indian man. Clean, fresh, confident.', true
where exists (select 1 from products p where p.id = 'myself')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'myself-002', 'myself', 'Shivangi R', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Shivangi R', 'My boyfriend wears this and it drives me crazy in the best way. Modern, fresh, magnetic. He gets compliments wherever we go together.', true
where exists (select 1 from products p where p.id = 'myself')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'myself-003', 'myself', 'Gautam T', null, 'Delhi', 'en-IN',
  4, '2026-04-05', 'Review by Gautam T', 'Really versatile. Works for morning meetings, afternoon chai breaks, and evening outings equally well. That is rare. Great buy.', true
where exists (select 1 from products p where p.id = 'myself')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'myself-004', 'myself', 'Aisha M', null, 'Jaipur', 'en-IN',
  5, '2026-04-05', 'Review by Aisha M', 'Got this for my brother''s graduation. He absolutely loves it. Crisp, clean, youthful. Perfect for a 24-year-old stepping into his first job.', true
where exists (select 1 from products p where p.id = 'myself')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'spice-001', 'spicebomb', 'Mihir D', null, 'Ahmedabad', 'en-IN',
  5, '2026-04-05', 'Review by Mihir D', 'The name says it all â€“ an absolute explosion of spice that settles into something incredibly warm and addictive. Winters in Gujarat are calling for this.', true
where exists (select 1 from products p where p.id = 'spicebomb')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'spice-002', 'spicebomb', 'Tanya S', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Tanya S', 'My husband wore this to a family dinner in winter and every male cousin was asking where to buy it. It''s that kind of fragrance â€“ a conversation starter.', true
where exists (select 1 from products p where p.id = 'spicebomb')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'spice-003', 'spicebomb', 'Kunal A', null, 'Mumbai', 'en-IN',
  4, '2026-04-05', 'Review by Kunal A', 'Bold, spicy, masculine. Projection is amazing. I get compliments even in crowded Mumbai trains which is saying something given the odds.', true
where exists (select 1 from products p where p.id = 'spicebomb')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'spice-004', 'spicebomb', 'Nisha P', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Nisha P', 'Bought as a winter gift for my dad. He called it ''the best fragrance I''ve smelled in 20 years.'' That coming from him means a lot.', true
where exists (select 1 from products p where p.id = 'spicebomb')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'srk-001', 'srk-special', 'Arjun S', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Arjun S', 'The name is perfect because this truly makes you feel like a superstar. The blend of woody sandalwood and fresh citrus is cinematic. Born for the red carpet.', true
where exists (select 1 from products p where p.id = 'srk-special')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'srk-002', 'srk-special', 'Monika T', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Monika T', 'Bought this thinking it was a gimmick but wow. It genuinely smells like what you''d imagine a Bollywood hero to smell like. My husband is obsessed.', true
where exists (select 1 from products p where p.id = 'srk-special')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'srk-003', 'srk-special', 'Rahul V', null, 'Jaipur', 'en-IN',
  5, '2026-04-05', 'Review by Rahul V', 'Special occasion perfume for me. I wear this to sangeets and family functions. Every time I walk in, someone notices immediately. Very powerful.', true
where exists (select 1 from products p where p.id = 'srk-special')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'srk-004', 'srk-special', 'Preeti M', null, 'Lucknow', 'en-IN',
  4, '2026-04-05', 'Review by Preeti M', 'Got it for my husband who is a huge SRK fan. The fan and the fragrance both passed our test. Elegant, warm, and long-lasting.', true
where exists (select 1 from products p where p.id = 'srk-special')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'terre-001', 'terre-de-hermes', 'Vivek S', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Vivek S', 'Earth, citrus, woods. It smells like a walk in a French forest and somehow works perfectly in a Bengaluru startup office. Versatile masterpiece.', true
where exists (select 1 from products p where p.id = 'terre-de-hermes')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'terre-002', 'terre-de-hermes', 'Aditi R', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Aditi R', 'Bought for my father-in-law who only wears French brands. He couldn''t tell the difference and called it exceptional. That is the highest compliment possible.', true
where exists (select 1 from products p where p.id = 'terre-de-hermes')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'terre-003', 'terre-de-hermes', 'Saurabh T', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Saurabh T', 'The pepper note at the opening is brilliant. Very earthy, masculine and unique. My daily for cooler months. People always notice.', true
where exists (select 1 from products p where p.id = 'terre-de-hermes')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'terre-004', 'terre-de-hermes', 'Pratiksha M', null, 'Mumbai', 'en-IN',
  4, '2026-04-05', 'Review by Pratiksha M', 'Reserved and sophisticated. Just like the kind of person I want my husband to be when he walks into a meeting. Does both jobs well.', true
where exists (select 1 from products p where p.id = 'terre-de-hermes')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'ultra-001', 'ultra-male', 'Rohit K', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Rohit K', 'Sweet masculinity done perfectly. The pear and lavender opening is genius. Wore this on our anniversary dinner and my wife said I smelled edible. Success.', true
where exists (select 1 from products p where p.id = 'ultra-male')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'ultra-002', 'ultra-male', 'Anisha P', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Anisha P', 'I personally love this scent â€“ bought it for my boyfriend but spray it on my pillow too. The vanilla and mint just lingers in the most beautiful way.', true
where exists (select 1 from products p where p.id = 'ultra-male')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'ultra-003', 'ultra-male', 'Dev M', null, 'Chandigarh', 'en-IN',
  4, '2026-04-05', 'Review by Dev M', 'This is for those who like their masculinity with a sweet edge. Works incredible in Punjab winters. The longevity is exceptional.', true
where exists (select 1 from products p where p.id = 'ultra-male')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'ultra-004', 'ultra-male', 'Kavita S', null, 'Jaipur', 'en-IN',
  5, '2026-04-05', 'Review by Kavita S', 'Gifted to my brother and now my dad also wants a bottle. That vanilla heart makes everyone around you want to get closer. Irresistible scent.', true
where exists (select 1 from products p where p.id = 'ultra-male')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'roma-001', 'valentino-born-in-roma-intense', 'Natasha K', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Natasha K', 'Dark jasmine, vanilla, and woods. This is my statement perfume. I wear this to fashion events and people always stop mid-conversation to ask what I''m wearing.', true
where exists (select 1 from products p where p.id = 'valentino-born-in-roma-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'roma-002', 'valentino-born-in-roma-intense', 'Vikrant M', null, 'Delhi', 'en-IN',
  4, '2026-04-05', 'Review by Vikrant M', 'Bought for my wife and she hasn''t touched any other fragrance since. The Italian luxury feel is real. Extremely elegant.', true
where exists (select 1 from products p where p.id = 'valentino-born-in-roma-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'roma-003', 'valentino-born-in-roma-intense', 'Priyanka V', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Priyanka V', 'This is everything I want in an evening fragrance. Rich, intense, feminine without being too floral. Perfect for a Bangalore date night.', true
where exists (select 1 from products p where p.id = 'valentino-born-in-roma-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'roma-004', 'valentino-born-in-roma-intense', 'Sahil T', null, 'Pune', 'en-IN',
  5, '2026-04-05', 'Review by Sahil T', 'My fiancÃ©e smells absolutely incredible in this. We did a blind test against the original and neither of us could tell. Brilliant.', true
where exists (select 1 from products p where p.id = 'valentino-born-in-roma-intense')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'yedp-001', 'ysl-y-edp', 'Ayush T', null, 'Delhi', 'en-IN',
  5, '2026-04-05', 'Review by Ayush T', 'Fresh fougere with real depth in the drydown. My go-to for any occasion where I need to look and smell put together. Clean, modern, masculine.', true
where exists (select 1 from products p where p.id = 'ysl-y-edp')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'yedp-002', 'ysl-y-edp', 'Pallavi S', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Pallavi S', 'Got this for my husband for our anniversary. The combination of apple, sage, and cedar is so well-balanced. He has gotten more confident since he started wearing it.', true
where exists (select 1 from products p where p.id = 'ysl-y-edp')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'yedp-003', 'ysl-y-edp', 'Neeraj K', null, 'Bengaluru', 'en-IN',
  4, '2026-04-05', 'Review by Neeraj K', 'Very versatile â€“ not too formal, not too casual. I wear this to work, to the gym, on dates. It adapts to every situation. Rare quality in a fragrance.', true
where exists (select 1 from products p where p.id = 'ysl-y-edp')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'yedp-004', 'ysl-y-edp', 'Divya N', null, 'Chennai', 'en-IN',
  5, '2026-04-05', 'Review by Divya N', 'Asked my boyfriend to try this and now he won''t wear anything else. Fresh and long-lasting in Chennai heat which is seriously impressive.', true
where exists (select 1 from products p where p.id = 'ysl-y-edp')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aqua-001', 'acqua-di-gio-profondo', 'Sanjay M', null, 'Mumbai', 'en-IN',
  5, '2026-04-05', 'Review by Sanjay M', 'The most wearable aquatic I have ever tried. Mumbai humidity is brutal but this stays fresh without going sour. Beachside in a bottle.', true
where exists (select 1 from products p where p.id = 'acqua-di-gio-profondo')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aqua-002', 'acqua-di-gio-profondo', 'Nidhi S', null, 'Bengaluru', 'en-IN',
  5, '2026-04-05', 'Review by Nidhi S', 'My brother has been wearing the original for years. Got him this and he genuinely could not tell the difference. He''s reordered twice. Speaks for itself.', true
where exists (select 1 from products p where p.id = 'acqua-di-gio-profondo')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aqua-003', 'acqua-di-gio-profondo', 'Harshit V', null, 'Jaipur', 'en-IN',
  5, '2026-04-05', 'Review by Harshit V', 'Summer in Rajasthan is no joke. This was recommended to me specifically for hot weather and it delivers. Never wilts, never goes sharp. Just perfect freshness.', true
where exists (select 1 from products p where p.id = 'acqua-di-gio-profondo')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

insert into reviews (
  id, product_id, author, avatar_url, reviewer_city, reviewer_language,
  rating, date, title, content, verified
)
select
  'aqua-004', 'acqua-di-gio-profondo', 'Pallavi T', null, 'Delhi', 'en-IN',
  4, '2026-04-05', 'Review by Pallavi T', 'Clean, aquatic, professional. My husband wears this to every formal event. It''s safe in the best possible sense â€“ universally loved by everyone.', true
where exists (select 1 from products p where p.id = 'acqua-di-gio-profondo')
on conflict (id) do update set
  product_id = excluded.product_id,
  author = excluded.author,
  avatar_url = excluded.avatar_url,
  reviewer_city = excluded.reviewer_city,
  reviewer_language = excluded.reviewer_language,
  rating = excluded.rating,
  date = excluded.date,
  title = excluded.title,
  content = excluded.content,
  verified = excluded.verified;

-- Quick summary
select product_id, count(*) as review_count
from reviews
where product_id in (
  'acqua-di-gio-profondo', 'bleu-de-chanel', 'creed-aventus', 'creed-viking', 'good-girl', 'gypsy-water', 'hawas', 'homme-intense', 'lattafa-khamrah-qahwa-100ml', 'lv-imagination', 'myself', 'ombre-leather', 'ombre-nomade', 'oud-wood', 'replica-jazz-club-100ml', 'sauvage-noir', 'spicebomb', 'srk-special', 'stronger-with-you-intensely', 'terre-de-hermes', 'ultra-male', 'valentino-born-in-roma-intense', 'ysl-y-edp'
)
group by product_id
order by product_id;

commit;
