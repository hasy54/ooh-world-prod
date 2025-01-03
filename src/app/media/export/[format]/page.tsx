'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { use } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit2, EyeOff, Trash2, Eye } from 'lucide-react'
import { Media } from '@/components/columns'
import Image from 'next/image'
import { exportToPPT } from '@/lib/exportToPPT'
import { exportToExcel } from '@/lib/exportToExcel'
import { exportToPDF } from '@/lib/exportToPDF'
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase'
import { ExportProgress } from '@/components/ExportProgress'
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs";

const generateContent = (
  mediaItems: Media[],
  options: {
    clientName: string;
    campaignName: string;
    bgColor: string;
    fontColor: string;
    hiddenFields: string[];
    logoPath: string;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
    };
  }
) => {
  const slides = [
    {
      type: 'title',
      content: {
        title: 'Media Presentation',
        clientName: options.clientName,
        campaignName: options.campaignName,
        date: new Date().toLocaleDateString(),
      },
    },
    ...mediaItems.map((item) => ({
      type: 'media',
      content: {
        name: item.name,
        image: item.image_urls?.[0] || item.thumbnail || "/placeholder.svg",
        details: [
          { label: 'Type', value: item.type },
          { label: 'Sub-Type', value: item.subtype },
          { label: 'Dimensions', value: `${item.width} x ${item.height}` },
          { label: 'Traffic', value: item.traffic },
          { label: 'Price', value: new Intl.NumberFormat("en-IN", { style: 'currency', currency: 'INR' }).format(item.price) },
          { label: 'Availability', value: item.availability ? 'Available' : 'Not Available' },
        ].filter(detail => !options.hiddenFields.includes(detail.label.toLowerCase())),
      },
    })),
    {
      type: 'closing',
      content: {
        title: 'Thank You!',
        contactInfo: options.contactInfo,
      },
    },
  ];

  return slides;
};


interface ExportData extends Media {
  isEditing?: boolean;
  isHidden?: boolean;
}

interface ExportOptions {
  sheetName?: string;
  fileName?: string;
  clientName: string;
  campaignName: string;
  bgColor: string;
  fontColor: string;
  hiddenFields: string[];
  logoPath: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

interface CampaignData {
  clientName: string;
  campaignName: string;
}

export default function ExportPreviewPage({ params: paramsPromise }: { params: Promise<{ format: string }> }) {
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<ExportData[]>([])
  const [campaignData, setCampaignData] = useState<CampaignData>({ clientName: 'Client Name', campaignName: 'Campaign Name' })
  const [clientName, setClientName] = useState('Client Name')
  const [campaignName, setCampaignName] = useState('Campaign Name')
  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fontColor, setFontColor] = useState('#000000')
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null)
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [contactAddress, setContactAddress] = useState<string | null>(null);
  const { format } = use(paramsPromise)
  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    fetchData()
  }, [setMediaItems])

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('logo_img_url, contact_email, phone, address')
          .eq('clerk_user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }

        setLogoSrc(data?.logo_img_url || null);
        setContactEmail(data?.contact_email || null);
        setContactPhone(data?.phone || null);
        setContactAddress(data?.address || null);
      } catch (error) {
        console.error('Unexpected error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId, supabase]);

  async function fetchData() {
    // Fetch selected media items
    const selectedMedia = JSON.parse(localStorage.getItem('selectedMedia') || '[]')
    const selectedMediaIds = selectedMedia.map((item: Media) => item.id)

    if (selectedMediaIds.length === 0) {
      console.warn('No media selected')
      setMediaItems([])
      return
    }

    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .in('id', selectedMediaIds)

    if (mediaError) {
      console.error('Error fetching media:', mediaError)
    } else {
      setMediaItems(mediaData.map(item => ({ ...item, isEditing: false, isHidden: false })))
    }
  }

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Preparing export...', { duration: Infinity });
    setExportProgress(0);

    try {
      const exportData = mediaItems.filter(item => !item.isHidden);
      const exportOptions = {
        clientName,
        campaignName,
        bgColor,
        fontColor,
        hiddenFields,
        logoPath: logoSrc || '/company-logo.png',
        contactInfo: {
          email: contactEmail || '',
          phone: contactPhone || '',
          address: contactAddress || ''
        }
      };

      const content = generateContent(exportData, exportOptions);
      

      switch (format) {
        case 'ppt':
          await exportToPPT(content, exportOptions, (progress) => {
            setExportProgress(progress);
            toast.loading(`Exporting PPT: ${progress}%`, { id: toastId });
          });
          toast.success('PPT successfully exported', { id: toastId });
          break;
        case 'excel':
          await exportToExcel(content, {
            clientName: exportOptions.clientName,
            campaignName: exportOptions.campaignName,
            logoPath: exportOptions.logoPath,
            hiddenFields: exportOptions.hiddenFields
          });
          toast.success('Excel file successfully exported', { id: toastId });
          break;
        case 'pdf':
          await exportToPDF(content, exportOptions);
          toast.success('PDF successfully exported', { id: toastId });
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error: unknown) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
    } finally {
      setExportProgress(100);
      setIsExporting(false);
    }
  };


  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-xl font-semibold mb-4">No media selected for export</p>
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Media Selection
        </Button>
      </div>
    )
  }

  const renderPreview = () => {
    const exportOptions = {
      clientName,
      campaignName,
      bgColor,
      fontColor,
      hiddenFields,
      logoPath: logoSrc || '/company-logo.png',
      contactInfo: {
        email: contactEmail || '',
        phone: contactPhone || '',
        address: contactAddress || ''
      }
    };

    const content = generateContent(mediaItems.filter(item => !item.isHidden), exportOptions);

    if (format === 'excel') {
      const visibleColumns = ['Name', 'Type', 'Sub-Type', 'Dimensions', 'Traffic', 'Price', 'Availability']
        .filter(col => !hiddenFields.includes(col.toLowerCase()));

      return (
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-video flex items-center justify-center">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt="Company Logo"
                  width={200}
                  height={120}
                  className="object-contain"
                />
              ) : (
                <div className="text-xl font-bold text-gray-500">COMPANY LOGO</div>
              )}
            </div>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-bold">CLIENT</div>
                <div>{clientName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-bold">CAMPAIGN</div>
                <div>{campaignName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-bold">GENERATED ON</div>
                <div>{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {visibleColumns.map((col, index) => (
                    <th key={index} className="border border-gray-300 p-3 text-left font-bold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.filter(slide => slide.type === 'media').map((slide, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {visibleColumns.map((col, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 p-3">
                        {col === 'Name' && 'name' in slide.content ? slide.content.name :
                         'details' in slide.content ? slide.content.details.find((d: {label: string, value: string}) => d.label === col)?.value || '' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4">
            <Image
              src="https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/logos/Made%20with%20Studiooh.svg"
              alt="Made with Studiooh"
              width={100}
              height={22}
              className="object-contain"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        {content.map((slide, index) => (
          <div 
            key={index} 
            className="bg-white aspect-[16/9] rounded-lg shadow-lg mb-4 relative overflow-hidden" 
            style={{ backgroundColor: bgColor }}
          >
            {slide.type === 'title' && (
              <div className="p-8 relative h-full">
                {exportOptions.logoPath && (
                  <div className="absolute left-8 top-8">
                    <Image
                      src={exportOptions.logoPath}
                      alt="Company Logo"
                      width={200}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                )}
                <h1 
                  className="text-[45px] font-normal mt-[180px] max-w-[600px]"
                  style={{ color: '#16161D', fontFamily: 'Inter' }}
                >
                  {'title' in slide.content ? slide.content.title : ''}
                </h1>
                <div 
                  className="mt-8 space-y-2 text-sm tracking-wide"
                  style={{ color: '#16161D', fontFamily: 'Inter' }}
                >
                  {'clientName' in slide.content && <p>Client: {slide.content.clientName}</p>}
                  {'campaignName' in slide.content && <p>Campaign: {slide.content.campaignName}</p>}
                  {'date' in slide.content && <p>Generated on: {slide.content.date}</p>}
                </div>
                <div className="absolute bottom-4 right-8">
                  <Image
                    src="https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/logos/Made%20with%20Studiooh.svg"
                    alt="Made with Studiooh"
                    width={100}
                    height={22}
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {slide.type === 'media' && (
              <div className="p-8 flex h-full">
                <div className="w-[30%]">
                  <h2 
                    className="text-xl font-normal mb-8"
                    style={{ color: '#16161D', fontFamily: 'Inter' }}
                  >
                    {'name' in slide.content ? slide.content.name : ''}
                  </h2>
                  <div 
                    className="space-y-2 text-sm tracking-wide"
                    style={{ color: '#16161D', fontFamily: 'Inter' }}
                  >
                    {'details' in slide.content && slide.content.details.map((detail: { label: string; value: string }, i: number) => (
                      <p key={i}>{detail.label}: {detail.value}</p>
                    ))}
                  </div>
                </div>
                <div className="w-[70%] h-full relative">
                  <Image
                    src={'image' in slide.content ? slide.content.image : ''}
                    alt={'name' in slide.content ? slide.content.name : ''}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="absolute bottom-4 right-8">
                  <Image
                    src="https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/logos/Made%20with%20Studiooh.svg"
                    alt="Made with Studiooh"
                    width={100}
                    height={22}
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {slide.type === 'closing' && (
              <div className="p-8 flex items-center justify-between h-full relative">
                <div className="w-1/4">
                  {logoSrc && (
                    <Image
                      src={logoSrc}
                      alt="Company Logo"
                      width={200}
                      height={120}
                      className="object-contain"
                    />
                  )}
                </div>
                <div 
                  className="w-1/2 text-sm space-y-1 tracking-wide"
                  style={{ color: '#16161D', fontFamily: 'Inter' }}
                >
                  {contactEmail && <p>Email: {contactEmail}</p>}
                  {contactPhone && <p>Phone: {contactPhone}</p>}
                  {contactAddress && <p>Address: {contactAddress}</p>}
                </div>
                <div className="absolute bottom-4 right-8">
                  <Image
                    src="https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/logos/Made%20with%20Studiooh.svg"
                    alt="Made with Studiooh"
                    width={100}
                    height={22}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const scrollToSlide = (index: number) => {
    const slideElements = previewRef.current?.querySelectorAll('.bg-white.aspect-video, .bg-white.p-8')
    if (slideElements && slideElements[index + 1]) {
      slideElements[index + 1].scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} className="flex items-center" disabled={isExporting}>
              {isExporting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Exporting...
                </>
              ) : (
                <>Export {format.toUpperCase()}</>
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-8 flex h-[calc(100vh-64px)]">
        <div className="w-1/3 pr-4 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Export Controls</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Hide Fields</h3>
              <div className="flex flex-wrap gap-2">
                {['price', 'traffic', 'dimensions', 'availability'].map((field) => (
                  <Toggle
                    key={field}
                    pressed={hiddenFields.includes(field)}
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        setHiddenFields([...hiddenFields, field]);
                      } else {
                        setHiddenFields(hiddenFields.filter((f) => f !== field));
                      }
                    }}
                    className="gap-2"
                  >
                    {hiddenFields.includes(field) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {field}
                  </Toggle>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="bgColor" className="min-w-[100px]">Background</Label>
                <div className="flex-1">
                  <div 
                    className="flex items-center h-9 w-[120px] rounded-md border border-input bg-background text-sm cursor-pointer"
                    onClick={() => document.getElementById('bgColor')?.click()}
                  >
                    <div className="flex-1 px-3 font-mono">#{bgColor.substring(1)}</div>
                    <div 
                      className="h-full w-10 rounded-r-md border-l"
                      style={{ backgroundColor: bgColor }}
                    />
                  </div>
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="sr-only"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="fontColor" className="min-w-[100px]">Text</Label>
                <div className="flex-1">
                  <div 
                    className="flex items-center h-9 w-[120px] rounded-md border border-input bg-background text-sm cursor-pointer"
                    onClick={() => document.getElementById('fontColor')?.click()}
                  >
                    <div className="flex-1 px-3 font-mono">#{fontColor.substring(1)}</div>
                    <div 
                      className="h-full w-10 rounded-r-md border-l"
                      style={{ backgroundColor: fontColor }}
                    />
                  </div>
                  <Input
                    id="fontColor"
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Media Items</h3>
              <div className="w-full">
                <table className="w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-3/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mediaItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => scrollToSlide(index)}>
                        <td className="px-4 py-4">
                          <div className="truncate" title={item.name}>
                            {item.name}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMediaItems(mediaItems.filter((_, i) => i !== index));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="w-2/3 pl-4 h-[calc(100vh-64px)] overflow-y-auto" ref={previewRef}>
          <h1 className="text-2xl font-semibold mb-6">Export Preview - {format.toUpperCase()}</h1>
          <div className="mb-8 max-w-full">
            {renderPreview()}
          </div>
          {exportProgress > 0 && <ExportProgress progress={exportProgress} />}
          <Toaster position="bottom-right" />
        </div>
      </div>
    </div>
  )
}

