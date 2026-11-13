/** Thông số giao diện 6 chủ đề lấy từ SchoolViolence/LifeSkills/LegalCorner/Psychology/SexEducation/SexualAbusePrevention Screen.kt */
export interface Topic { bar: string; color: string; dark: string; hero: string; sub: (n: number) => string; head: string; disp: string; bg: string; grad2?: string }
export const TOPICS: Record<string, Topic> = {
  BAO_LUC_HOC_DUONG: { bar: 'PHÒNG CHỐNG BẠO LỰC', color: '#E74C3C', dark: '#2C3E50', hero: 'TRƯỜNG HỌC\nAN TOÀN', sub: (n) => `${n} bài học xây dựng môi trường hạnh phúc`, head: 'CẨM NANG PHÒNG CHỐNG BẠO LỰC', disp: 'Bạo lực học đường', bg: '#F8F9FA' },
  KY_NANG_SONG: { bar: 'KHO KỸ NĂNG SỐNG', color: '#27AE60', dark: '#1B5E20', hero: 'LÀM CHỦ\nCUỘC ĐỜI', sub: (n) => `Trang bị ${n} kỹ năng cốt lõi cho tương lai`, head: 'DANH SÁCH BÀI HỌC KỸ NĂNG', disp: 'Kỹ năng sống', bg: '#F8F9FA', grad2: '#2ECC71' },
  GOC_PHAP_LUAT: { bar: 'GÓC PHÁP LUẬT', color: '#E67E22', dark: '#2C3E50', hero: 'HIỂU LUẬT\nĐỂ TỰ VỆ', sub: (n) => `${n} kiến thức pháp luật nền tảng`, head: 'DANH SÁCH BÀI HỌC PHÁP LUẬT', disp: 'Góc pháp luật', bg: '#F8F9FA' },
  TAM_LY: { bar: 'TÂM LÝ HỌC ĐƯỜNG', color: '#9B59B6', dark: '#4A148C', hero: 'KHÁM PHÁ\nTÂM HỒN', sub: (n) => `${n} bài học giúp bạn tìm lại sự bình yên`, head: 'CẨM NANG TÂM LÝ HỌC ĐƯỜNG', disp: 'Tâm lý học đường', bg: '#F8F9FA' },
  GIOI_TINH: { bar: 'GIÁO DỤC GIỚI TÍNH', color: '#F06292', dark: '#880E4F', hero: 'HIỂU VỀ MÌNH\nYÊU CHÍNH MÌNH', sub: (n) => `${n} bài học về giới tính và sức khỏe`, head: 'HÀNH TRÌNH TRƯỞNG THÀNH RẠNG RỠ', disp: 'Giáo dục giới tính', bg: '#FDFEFE' },
  PHONG_CHONG_XAM_HAI: { bar: 'PHÒNG CHỐNG XÂM HẠI', color: '#B71C1C', dark: '#1A237E', hero: 'HIỂU BIẾT LÀ\nLÁ CHẮN', sub: (n) => `${n} bài học bảo vệ bản thân an toàn`, head: 'KỸ NĂNG BẢO VỆ BẢN THÂN CỐT LÕI', disp: 'Phòng chống xâm hại', bg: '#F8F9FA' }
};
export interface Lesson { id: string; title: string; content: string; chapter: string; category: string; order: number }
