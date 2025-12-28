
import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Camera, 
  Users, 
  ShoppingBag, 
  Briefcase, 
  Heart, 
  Palette, 
  ChevronRight, 
  ArrowLeft,
  Send,
  Loader2,
  Trash2,
  Upload,
  ArrowRight,
  Download,
  Printer
} from 'lucide-react';
import { AppMode, ComicConfig, ColoringConfig, ComicPage, Panel } from './types';
import { MENU_DATABASE } from './constants';
import * as gemini from './services/geminiService';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>('HOME');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // States for Comic
  const [comicPages, setComicPages] = useState<ComicPage[]>([]);
  const [comicContext, setComicContext] = useState("");
  const [isComicTamat, setIsComicTamat] = useState(false);

  // Form States
  const [comicConfig, setComicConfig] = useState<ComicConfig>({
    topic: '',
    character: '',
    style: 'Manga/Anime',
    mood: 'Ceria',
    aspectRatio: '1:1',
    language: 'Indonesia'
  });

  const [coloringConfig, setColoringConfig] = useState<ColoringConfig>({
    object: '',
    age: '5-7 tahun'
  });

  const [genericInput, setGenericInput] = useState('');
  const [miniMeInput, setMiniMeInput] = useState('');
  const [miniMeImage, setMiniMeImage] = useState<string | null>(null);

  const resetState = () => {
    setOutput(null);
    setError(null);
    setGenericInput('');
    setMiniMeInput('');
    setMiniMeImage(null);
    setComicPages([]);
    setComicContext("");
    setIsComicTamat(false);
  };

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
    resetState();
  };

  const handleComicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setComicPages([]);
    try {
      await generateNextComicPage(1, "");
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan komik.');
    } finally {
      setLoading(false);
    }
  };

  const generateNextComicPage = async (pageNumber: number, context: string) => {
    setLoading(true);
    try {
      const { panels: panelData, summary, isTamat } = await gemini.generateComicPanels(comicConfig, pageNumber, context);
      
      const newPage: ComicPage = {
        pageNumber,
        panels: panelData.map((p: any) => ({ ...p, loading: true })),
        isLastPage: isTamat
      };

      setComicPages(prev => [...prev, newPage]);
      setComicContext(prev => prev + " " + summary);
      setIsComicTamat(isTamat);

      // Generate images for each panel in the background
      for (let i = 0; i < panelData.length; i++) {
        const imageUrl = await gemini.generateImageForPanel(panelData[i].description, comicConfig.style, comicConfig.character);
        updatePanelImage(pageNumber, i, imageUrl);
      }
    } catch (err) {
      setError("Gagal memuat halaman komik.");
    } finally {
      setLoading(false);
    }
  };

  const updatePanelImage = (pageNumber: number, panelIndex: number, imageUrl: string | null) => {
    setComicPages(prev => prev.map(page => {
      if (page.pageNumber === pageNumber) {
        const newPanels = [...page.panels];
        newPanels[panelIndex] = { ...newPanels[panelIndex], imageUrl: imageUrl || undefined, loading: false };
        return { ...page, panels: newPanels };
      }
      return page;
    }));
  };

  const handleColoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await gemini.generateColoringBook(coloringConfig);
      setOutput(res);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan gambar mewarnai.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenericSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericInput.trim()) return;
    setLoading(true);
    try {
      const res = await gemini.generateGenericContent(currentMode, genericInput);
      setOutput(res);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleMiniMeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await gemini.generateCaricature(miniMeInput, miniMeImage || undefined);
      setOutput(res);
    } catch (err: any) {
      setError(err.message || 'Analisis wajah gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMiniMeImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderHome = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-8 animate-in fade-in duration-700">
      {MENU_DATABASE.map((cat) => (
        <div key={cat.title} className="space-y-4">
          <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            {cat.title === 'EDUKASI' && <BookOpen className="w-5 h-5" />}
            {cat.title === 'PHOTO STUDIO' && <Camera className="w-5 h-5" />}
            {cat.title === 'UGC AFFILIATE' && <Users className="w-5 h-5" />}
            {cat.title === 'AFFILIATE E-COMMERCE' && <ShoppingBag className="w-5 h-5" />}
            {cat.title === 'ALAT BISNIS' && <Briefcase className="w-5 h-5" />}
            {cat.title === 'FAMILY & LIFESTYLE' && <Heart className="w-5 h-5" />}
            {cat.title === 'AI CREATIVE SUITE' && <Palette className="w-5 h-5" />}
            {cat.title}
          </h3>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleModeChange(item.id)}
                className="w-full text-left p-4 glass rounded-xl hover:bg-white/5 transition-all group border-white/5 hover:border-blue-500/50 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderComicPage = (page: ComicPage) => (
    <div key={page.pageNumber} className="bg-white text-black p-8 rounded-sm shadow-2xl mx-auto mb-12" style={{ width: '100%', maxWidth: '800px', aspectRatio: '1/1.414' }}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
          <h4 className="font-bold uppercase tracking-widest text-sm text-black">NAEZAK AI STUDIO Comics • {comicConfig.topic}</h4>
          <span className="font-bold text-black">Hal. {page.pageNumber}</span>
        </div>
        
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {page.panels.map((panel, idx) => (
            <div key={idx} className="border-2 border-black relative overflow-hidden group">
              {panel.loading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
                  <Loader2 className="animate-spin w-8 h-8 text-gray-300" />
                </div>
              ) : (
                <img src={panel.imageUrl} alt={`Panel ${idx+1}`} className="w-full h-full object-cover" />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black p-2 min-h-[60px] flex items-center justify-center text-center">
                <p className="text-[10px] md:text-xs leading-tight font-medium italic text-black">
                  {panel.dialog}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-[10px] font-bold uppercase border-t-2 border-black pt-2 text-black">
          Hasilkan oleh NAEZAK AI STUDIO Core-Intelligence
        </div>
      </div>
    </div>
  );

  const renderOutput = () => {
    if (currentMode === 'KOMIK' && comicPages.length > 0) {
      return (
        <div className="space-y-12 animate-in fade-in duration-500">
          {comicPages.map(renderComicPage)}
          
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 justify-center items-center pb-12">
            {!isComicTamat ? (
              <button
                disabled={loading}
                onClick={() => generateNextComicPage(comicPages.length + 1, comicContext)}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                Lanjut ke Halaman {comicPages.length + 1}
              </button>
            ) : (
              <div className="text-center p-8 glass rounded-2xl border-green-500/30">
                <h3 className="text-2xl font-bold text-green-400 mb-2 text-green-400">Cerita Tamat 🏁</h3>
                <p className="text-gray-400">Anda telah menyelesaikan komik ini.</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-4 glass rounded-xl hover:bg-white/10 text-white"><Printer className="w-5 h-5"/></button>
              <button onClick={resetState} className="p-4 glass rounded-xl hover:bg-white/10 text-red-400"><Trash2 className="w-5 h-5"/></button>
            </div>
          </div>
        </div>
      );
    }

    if (currentMode === 'BUKU_MEWARNAI' && output?.includes('<svg')) {
      return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white p-12 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden min-h-[400px]">
            <div dangerouslySetInnerHTML={{ __html: output }} className="w-full max-w-md h-auto" />
          </div>
          <div className="flex gap-4">
            <button onClick={() => setOutput(null)} className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-medium text-white">Buat Baru</button>
            <button onClick={() => window.print()} className="flex-1 py-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all font-bold text-white">Cetak / Simpan</button>
          </div>
        </div>
      );
    }

    if (output) {
      return (
        <div className="prose prose-invert max-w-none glass p-8 rounded-2xl border-white/10 animate-in slide-in-from-bottom duration-500 relative">
          <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-blue-400">Hasil Blueprint NAEZAK AI STUDIO ✨</h3>
            <button onClick={() => setOutput(null)} className="text-gray-400 hover:text-white"><Trash2 className="w-5 h-5"/></button>
          </div>
          <div className="markdown-content">
            {output.split('\n').map((line, i) => (
              <p key={i} className="mb-2 text-gray-200 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderConfigForm = () => {
    switch (currentMode) {
      case 'KOMIK':
        return (
          <form onSubmit={handleComicSubmit} className="space-y-6 glass p-8 rounded-2xl max-w-2xl mx-auto border-blue-500/20">
            <h2 className="text-2xl font-bold text-center mb-8 text-white">NAEZAK AI STUDIO Comic Studio 🎨</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Topik Cerita</label>
                <input
                  type="text"
                  placeholder="Contoh: Petualangan Astronot Kucing di Mars"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  value={comicConfig.topic}
                  onChange={(e) => setComicConfig({ ...comicConfig, topic: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tokoh Utama & Ciri Fisik (Konsistensi Karakter)</label>
                <textarea
                  placeholder="Detail penting untuk konsistensi: Contoh: Kucing oranye, memakai kacamata hijau, syal biru tua"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  value={comicConfig.character}
                  onChange={(e) => setComicConfig({ ...comicConfig, character: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Gaya Seni</label>
                  <select
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={comicConfig.style}
                    onChange={(e) => setComicConfig({ ...comicConfig, style: e.target.value })}
                  >
                    {['Manga/Anime', 'Comic Book American', 'Pixar Style', 'Watercolor'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Mood</label>
                  <select
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={comicConfig.mood}
                    onChange={(e) => setComicConfig({ ...comicConfig, mood: e.target.value })}
                  >
                    {['Ceria', 'Misterius', 'Petualangan Epik', 'Menyentuh Hati'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              Generate Halaman 1
            </button>
          </form>
        );

      case 'BUKU_MEWARNAI':
        return (
          <form onSubmit={handleColoringSubmit} className="space-y-6 glass p-8 rounded-2xl max-w-lg mx-auto border-purple-500/20">
            <h2 className="text-2xl font-bold text-center mb-8 text-white">Buku Mewarnai 🎨</h2>
            <div className="space-y-4 text-white">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Objek Gambar</label>
                <input
                  type="text"
                  placeholder="Contoh: Naga yang lucu"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={coloringConfig.object}
                  onChange={(e) => setColoringConfig({ ...coloringConfig, object: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Usia</label>
                <input
                  type="text"
                  placeholder="Contoh: 4-6 tahun"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={coloringConfig.age}
                  onChange={(e) => setColoringConfig({ ...coloringConfig, age: e.target.value })}
                  required
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Palette className="w-5 h-5" />}
              Generate Garis Mewarnai (SVG)
            </button>
          </form>
        );

      case 'MINI_ME':
        return (
          <form onSubmit={handleMiniMeSubmit} className="space-y-6 glass p-8 rounded-2xl max-w-lg mx-auto border-pink-500/20">
            <h2 className="text-2xl font-bold text-center mb-8 text-white">Mini Me / Karikatur 🤡</h2>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-pink-500/50 transition-colors cursor-pointer relative text-white">
                {miniMeImage ? (
                  <div className="relative group">
                    <img src={miniMeImage} alt="Preview" className="w-32 h-32 object-cover rounded-full border-4 border-pink-500/30" />
                    <button type="button" onClick={() => setMiniMeImage(null)} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-500 mb-2" />
                    <span className="text-gray-400 text-sm">Upload Foto (Opsional)</span>
                  </>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi Wajah</label>
                <textarea
                  placeholder="Ceritakan detail wajah atau unggah foto di atas..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                  value={miniMeInput}
                  onChange={(e) => setMiniMeInput(e.target.value)}
                  required={!miniMeImage}
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-orange-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Users className="w-5 h-5" />}
              Analisis Karikatur
            </button>
          </form>
        );

      default:
        return (
          <form onSubmit={handleGenericSubmit} className="space-y-4 max-w-2xl mx-auto mt-12">
            <div className="relative">
              <textarea
                placeholder={`Apa yang bisa NAEZAK AI STUDIO bantu dalam mode ${currentMode}?`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pr-16 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none text-white"
                value={genericInput}
                onChange={(e) => setGenericInput(e.target.value)}
              />
              <button disabled={loading} className="absolute bottom-4 right-4 bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 text-white">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleModeChange('HOME')}>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:rotate-12 transition-transform text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white">NAEZAK AI STUDIO <span className="text-xs font-normal text-gray-400 ml-1">v2.1</span></h1>
        </div>
        {currentMode !== 'HOME' && (
          <button onClick={() => handleModeChange('HOME')} className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all text-sm font-medium text-white">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {currentMode === 'HOME' ? (
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
                Creative Suite <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Visual Mastery
                </span>
              </h2>
            </div>
            {renderHome()}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4 max-w-4xl mx-auto">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                <Sparkles />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{currentMode.replace(/_/g, ' ')}</h2>
                <p className="text-gray-400 text-sm">Mode aktif: Asisten Visual Premium</p>
              </div>
            </div>
            {!output && comicPages.length === 0 ? renderConfigForm() : renderOutput()}
          </div>
        )}
      </main>

      <footer className="py-8 text-center border-t border-white/5 text-gray-600 text-sm">
        &copy; 2024 NAEZAK AI STUDIO Creative Suite.
      </footer>

      {loading && !comicPages.length && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
          <p className="text-xl font-bold text-white">Membangun Visual Masterpiece...</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)}><Trash2 className="w-4 h-4"/></button>
        </div>
      )}
    </div>
  );
};

export default App;
