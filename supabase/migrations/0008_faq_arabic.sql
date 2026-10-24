-- 0008: Arabic for the eleven FAQ entries (#48) in the live faq table. Rows are matched by their
-- English question, the key the seed import uses, and only empty Arabic fields are filled, so
-- anything already written under /admin/faq is kept. The partnership answer now points to the
-- Community page (the Officers page redirects there). Safe to run again.

update public.faq set q_ar = 'هل يجب أن أدرس علوم الحاسب؟', a_ar = 'لا. ينتمي أعضاؤنا إلى جميع كليات جامعة الملك فهد للبترول والمعادن. إذا كان لديك فضول تجاه التقنية، فمكانك معنا.'
  where q_en = 'Do I need to study computer science?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'هل المشاركة مجانية؟', a_ar = 'نعم. العضوية والفعاليات وورش العمل مجانية لطلاب جامعة الملك فهد للبترول والمعادن.'
  where q_en = 'Is it free?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'أنا مبتدئ تمامًا. من أين أبدأ؟', a_ar = 'احضر أي ورشة عمل؛ فهي تبدأ من الصفر، ويوجد دائمًا من يمكنك سؤاله. تناولت الورش الأخيرة Git، وتطوير الويب، وReact، وFlutter، وArduino، وهندسة الأوامر، والحوسبة السحابية، وClaude.'
  where q_en = 'I''m a complete beginner. Where do I start?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'كيف أنضم؟', a_ar = 'استخدم زر Join في أعلى الموقع. يفتح باب التقديم في بداية كل فصل دراسي، وفي اللقاء التعريفي تتعرف على الفرق.'
  where q_en = 'How do I join?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'كيف أعرف مواعيد الفعاليات؟', a_ar = 'كل فعالية موجودة في صفحة Timeline مع روابط لإضافتها بنقرة واحدة إلى تقويم Google أو Outlook أو Apple. كما نعلن عن كل شيء على X عبر @KFUPM_CC، وعلى Instagram وLinkedIn.'
  where q_en = 'How do I know when something is happening?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'أين تقام الفعاليات؟', a_ar = 'داخل حرم الجامعة. يذكر كل إعلان المبنى والقاعة، وتعقد بعض الجلسات عن بعد.'
  where q_en = 'Where do events take place?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'هل يمكن لطلاب الجامعات الأخرى المشاركة؟', a_ar = 'بعض الفعاليات مفتوحة لغير طلاب الجامعة. فقد استضاف Techathon فرقًا من جامعات في أنحاء المملكة، ورحب KAUST Connect بطلاب من IAU وKFU. ويوضح كل إعلان من يحق له التسجيل.'
  where q_en = 'Can students from other universities take part?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'هل توجد جوائز؟', a_ar = 'نعم. تأتي المسابقات والهاكاثونات بجوائز معلنة، من تحديات بقيمة 3,000 ريال إلى Streamathon بجوائز قيمتها 40,000 ريال. ويعرضها قسم Impact في الصفحة الرئيسية حسب الفصل الدراسي.'
  where q_en = 'Are there prizes?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'كيف أشارك بما هو أكثر من الحضور؟', a_ar = 'انضم إلى أحد الفرق: الفعاليات أو الإعلام أو الفريق التقني. اكتب في المدونة. أو اقترح ورشة عمل تود تقديمها، وستساعدك الهيئة الإدارية على تنظيمها.'
  where q_en = 'How do I get involved beyond attending?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'هل يمكنني الكتابة في المدونة؟', a_ar = 'نعم. الأعضاء هم من يكتبون المقالات: ملخصات الفعاليات، والدروس التعليمية، وما تعلموه. تحدث إلى أي عضو في الهيئة الإدارية وسيساعدك على البدء.'
  where q_en = 'Can I write for the blog?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';
update public.faq set q_ar = 'شركتي ترغب في التعاون مع النادي. بمن أتواصل؟', a_ar = 'افتح صفحة Community وتواصل مع قيادة النادي مباشرة. وقد نظمت شركات معنا هاكاثونات ومحاضرات وزيارات لمكاتبها وورش عمل.'
  where q_en = 'My company wants to work with the club. Who do I contact?' and coalesce(q_ar, '') = '' and coalesce(a_ar, '') = '';

update public.faq set a_en = 'Open the Community page and reach the leadership team directly. Companies have run hackathons, talks, office visits and workshops with us.'
  where a_en = 'Open the Officers page and reach the leadership team directly. Companies have run hackathons, talks, office visits and workshops with us.';
