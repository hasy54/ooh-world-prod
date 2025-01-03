'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter, FileText, Upload, X, Plus, Trash2, ChevronDown } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { columns as originalColumns } from "@/components/columns"
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Separator } from "@/components/ui/separator"
import { SelectedMediaDetails } from '@/components/SelectedMediaDetails'

interface UploadPreview {
  file: File;
  preview: string;
}

export interface Media {
  id: string;
  name: string;
  type: string;
  subtype: string;
  width: number;
  height: number;
  location: string;
  city: string;
  price: number;
  availability: boolean;
  traffic: number;
  thumbnail: string;
  image_urls: string[];
}

const columns: ColumnDef<Media>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(price);
      return formatted;
    },
  },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as boolean;
      return (
        <Badge variant={availability ? "default" : "destructive"}>
          {availability ? "Available" : "Unavailable"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const width = row.original.width;
      const height = row.original.height;
      return <span className="whitespace-nowrap">{`${width} x ${height}`}</span>;
    },
  },
  {
    accessorKey: "city",
    header: "City",
  },
];


export default function MediaPage() {
  const { userId } = useAuth() // Clerk ID
  const [data, setData] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    type?: string[];
    availability?: string;
  }>({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreview[]>([])
  const [showUploadConfirm, setShowUploadConfirm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; index: number | null }>({ show: false, index: null });
  const [unavailableConfirmation, setUnavailableConfirmation] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const [availableConfirmation, setAvailableConfirmation] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const [searchColumn, setSearchColumn] = useState<string>('all')


  const handleReplaceImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedItem) {
        try {
          const { data, error } = await supabase.storage
            .from('media_images')
            .upload(`${selectedItem.id}/${file.name}`, file, { upsert: true });
          
          if (error) {
            if (error.message.includes('409')) {
              console.log('File already exists, fetching existing image');
              const { data: existingFile } = await supabase.storage
                .from('media_images')
                .getPublicUrl(`${selectedItem.id}/${file.name}`);
              
              if (existingFile) {
                const updatedImageUrls = [...(selectedItem.image_urls || [])];
                updatedImageUrls[currentImageIndex] = existingFile.publicUrl;
                await updateMediaItem(selectedItem.id, { image_urls: updatedImageUrls });
              }
            } else {
              console.error('Error uploading file:', error);
              return;
            }
          } else if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('media_images')
              .getPublicUrl(`${selectedItem.id}/${file.name}`);

            const updatedImageUrls = [...(selectedItem.image_urls || [])];
            updatedImageUrls[currentImageIndex] = publicUrl;
            await updateMediaItem(selectedItem.id, { image_urls: updatedImageUrls });
          }
        } catch (error) {
          console.error('Error handling file:', error);
        }
      }
    };
    input.click();
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedItem) {
        try {
          const { data, error } = await supabase.storage
            .from('media_images')
            .upload(`${selectedItem.id}/${file.name}`, file);
          
          if (error) {
            if (error.message.includes('409')) {
              console.log('File already exists, fetching existing image');
              const { data: existingFile } = await supabase.storage
                .from('media_images')
                .getPublicUrl(`${selectedItem.id}/${file.name}`);
              
              if (existingFile) {
                const updatedImageUrls = [...(selectedItem.image_urls || []), existingFile.publicUrl];
                await updateMediaItem(selectedItem.id, { image_urls: updatedImageUrls });
              }
            } else {
              console.error('Error uploading file:', error);
              return;
            }
          } else if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('media_images')
              .getPublicUrl(`${selectedItem.id}/${file.name}`);

            const updatedImageUrls = [...(selectedItem.image_urls || []), publicUrl];
            await updateMediaItem(selectedItem.id, { image_urls: updatedImageUrls });
          }
        } catch (error) {
          console.error('Error handling file:', error);
        }
      }
    };
    input.click();
  };

  useEffect(() => {
    fetchData()
  }, [userId])

  async function fetchData() {
    if (!userId) return

    // First, get the Supabase user ID from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return
    }

    setSupabaseUserId(userData.user_id)

    // Then fetch media items for this user
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('*, image_urls')
      .eq('user_id', userData.user_id)

    if (mediaError) {
      console.error('Error fetching media:', mediaError)
    } else {
      setData(mediaData as Media[])
      if (mediaData.length > 0) {
        setSelectedItemId((mediaData[0] as Media).id)
      }
    }
    setIsLoading(false)
  }

  const handleRowClick = useCallback((item: Media) => {
    setSelectedItemId(item.id);
  }, []);

  const selectedItem = useMemo(() => {
    return data.find(item => item.id === selectedItemId) || null;
  }, [data, selectedItemId]);

  const mediaTypes = useMemo(() => {
    const types = new Set(data.map(item => item.type));
    return ['all', ...Array.from(types)];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesType = selectedMediaType === 'all' || item.type === selectedMediaType;
      const matchesAvailability = !showAvailableOnly || item.availability;
      
      let matchesSearch = true;
      if (searchQuery) {
        if (searchColumn === 'all') {
          matchesSearch = Object.values(item).some(value =>
            value !== null && value !== undefined && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          const columnValue = item[searchColumn as keyof Media];
          matchesSearch = columnValue !== null && 
                          columnValue !== undefined && 
                          columnValue.toString().toLowerCase().includes(searchQuery.toLowerCase());
        }
      }

      return matchesType && matchesAvailability && matchesSearch;
    });
  }, [data, searchQuery, selectedMediaType, showAvailableOnly, searchColumn]);


  const handleRowSelection = useCallback((item: Media, isSelected: boolean) => {
    setSelectedMedia(prev => 
      isSelected 
        ? [...prev, item]
        : prev.filter(media => media.id !== item.id)
    )
  }, [])

  const handleExport = (format: 'ppt' | 'excel' | 'pdf') => {
    localStorage.setItem('selectedMedia', JSON.stringify(selectedMedia))
    router.push(`/media/export/${format}`)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const previews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setUploadPreviews(previews)
    setShowUploadConfirm(true)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    }
  })

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      uploadPreviews.forEach(preview => URL.revokeObjectURL(preview.preview))
    }
  }, [uploadPreviews])

  const handleUploadConfirm = async () => {
    if (!selectedItem?.id) {
      alert('Please select a media item before uploading.')
      return
    }

    setIsUploading(true)

    const uploadedUrls: string[] = []
    for (let i = 0; i < uploadPreviews.length; i++) {
      try {
        const preview = uploadPreviews[i]
        const file = preview.file
        const sanitizedFilename = file.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '')
        const { data, error } = await supabase.storage
          .from('media_images')
          .upload(`${selectedItem.id}/${sanitizedFilename}`, file)

        if (error) {
          console.error('File upload error:', error)
          continue
        }

        const publicUrl = supabase.storage
          .from('media_images')
          .getPublicUrl(`${selectedItem.id}/${sanitizedFilename}`).data?.publicUrl

        if (publicUrl) {
          uploadedUrls.push(publicUrl)
        }

        // Update progress
        const progress = ((i + 1) / uploadPreviews.length) * 100
        setUploadProgress(progress)
      } catch (error) {
        console.error('Error during file upload:', error)
      }
    }

    if (uploadedUrls.length > 0) {
      const updatedImageUrls = [
        ...(selectedItem.image_urls || []),
        ...uploadedUrls,
      ]

      await supabase
        .from('media')
        .update({ image_urls: updatedImageUrls })
        .eq('id', selectedItem.id)

      // Update local state
      setData(prevData => prevData.map(item => 
        item.id === selectedItem?.id 
          ? { ...item, image_urls: updatedImageUrls }
          : item
      ))

      alert('Images uploaded successfully!')
    } else {
      alert('No images were successfully uploaded.')
    }

    setIsUploading(false)
    setUploadPreviews([])
    setShowUploadConfirm(false)
    setUploadProgress(0)
  }

  const handleUploadCancel = () => {
    uploadPreviews.forEach(preview => URL.revokeObjectURL(preview.preview))
    setUploadPreviews([])
    setShowUploadConfirm(false)
    setUploadProgress(0)
  }

  const handleDeleteImage = async (index: number) => {
    setDeleteConfirmation({ show: true, index });
  };

  const confirmDeleteImage = async () => {
    if (deleteConfirmation.index !== null && selectedItem) {
      const updatedImageUrls = [...selectedItem.image_urls];
      const deletedImageUrl = updatedImageUrls.splice(deleteConfirmation.index, 1)[0];

      // Delete the file from Supabase storage
      const fileName = deletedImageUrl.split('/').pop();
      if (fileName) {
        const { error } = await supabase.storage
          .from('media_images')
          .remove([`${selectedItem.id}/${fileName}`]);

        if (error) {
          console.error('Error deleting file from storage:', error);
        }
      }

      // Update the media item in the database
      await updateMediaItem(selectedItem.id, { image_urls: updatedImageUrls });

      if (currentImageIndex >= updatedImageUrls.length) {
        setCurrentImageIndex(Math.max(0, updatedImageUrls.length - 1));
      }
    }
    setDeleteConfirmation({ show: false, index: null });
  };

  const DeleteConfirmationDialog = () => (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="mx-auto flex min-h-10 w-fit min-w-[21.25rem] items-center rounded-full bg-black pl-3 pr-2 text-white shadow-xl shadow-black/25 before:pointer-events-none before:absolute before:inset-px before:rounded-full before:shadow-[inset_0_1px_0] before:shadow-white/6">
        <div className="mr-2 flex items-center">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8.0002" r="5.8" fill="#D9D9DE" fillOpacity="0.1" stroke="#D9D9DE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 6.3998C8.44182 6.3998 8.8 6.04163 8.8 5.5998C8.8 5.15798 8.44182 4.7998 8 4.7998C7.55817 4.7998 7.2 5.15798 7.2 5.5998C7.2 6.04163 7.55817 6.3998 8 6.3998ZM8 7.9998C7.55817 7.9998 7.2 8.35798 7.2 8.7998V10.3998C7.2 10.8416 7.55817 11.1998 8 11.1998C8.44182 11.1998 8.8 10.8416 8.8 10.3998V8.7998C8.8 8.35798 8.44182 7.9998 8 7.9998Z" fill="#D9D9DE"></path>
          </svg>
        </div>
        <div className="whitespace-nowrap pr-2.5 font-book">
          Do you want to delete this image?
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setDeleteConfirmation({ show: false, index: null })}
            className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.gray.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.1)] [--button-color-ring:theme(colors.gray.500/0.4)] px-2 min-w-[3.25rem]"
            type="button"
          >
            <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">Cancel</span>
          </button>
          <button
            onClick={confirmDeleteImage}
            className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.red.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.2)] [--button-color-ring:theme(colors.red.500/0.4)] px-2 min-w-[3.25rem]"
            type="button"
          >
            <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const markSelectedMediaUnavailable = async () => {
    const updatedMedia = await Promise.all(selectedMedia.map(async (item) => {
      const { data, error } = await supabase
        .from('media')
        .update({ availability: false })
        .eq('id', item.id)
        .select()
    
      if (error) {
        console.error('Error updating media:', error)
        return item
      }
      return data[0]
    }))

    setData(prevData => prevData.map(item => {
      const updatedItem = updatedMedia.find(updated => updated.id === item.id)
      return updatedItem || item
    }))

    setSelectedMedia([])
    setUnavailableConfirmation({ show: false, count: 0 })
  }

  const UnavailableConfirmationDialog = () => (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="mx-auto flex min-h-10 w-fit min-w-[21.25rem] items-center rounded-full bg-black pl-3 pr-2 text-white shadow-xl shadow-black/25 before:pointer-events-none before:absolute before:inset-px before:rounded-full before:shadow-[inset_0_1px_0] before:shadow-white/6">
        <div className="mr-2 flex items-center">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8.0002" r="5.8" fill="#D9D9DE" fillOpacity="0.1" stroke="#D9D9DE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 6.3998C8.44182 6.3998 8.8 6.04163 8.8 5.5998C8.8 5.15798 8.44182 4.7998 8 4.7998C7.55817 4.7998 7.2 5.15798 7.2 5.5998C7.2 6.04163 7.55817 6.3998 8 6.3998ZM8 7.9998C7.55817 7.9998 7.2 8.35798 7.2 8.7998V10.3998C7.2 10.8416 7.55817 11.1998 8 11.1998C8.44182 11.1998 8.8 10.8416 8.8 10.3998V8.7998C8.8 8.35798 8.44182 7.9998 8 7.9998Z" fill="#D9D9DE"></path>
          </svg>
        </div>
        <div className="whitespace-nowrap pr-2.5 font-book">
          Mark {unavailableConfirmation.count} media as unavailable?
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setUnavailableConfirmation({ show: false, count: 0 })}
            className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.gray.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.1)] [--button-color-ring:theme(colors.gray.500/0.4)] px-2 min-w-[3.25rem]"
            type="button"
          >
            <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">Cancel</span>
          </button>
          <button
            onClick={markSelectedMediaUnavailable}
            className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.red.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.2)] [--button-color-ring:theme(colors.red.500/0.4)] px-2 min-w-[3.25rem]"
            type="button"
          >
            <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">
              Confirm
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const markSelectedMediaAvailable = async () => {
    const updatedMedia = await Promise.all(selectedMedia.map(async (item) => {
      const { data, error } = await supabase
        .from('media')
        .update({ availability: true })
        .eq('id', item.id)
        .select()
    
      if (error) {
        console.error('Error updating media:', error)
        return item
      }
      return data[0]
    }))

    setData(prevData => prevData.map(item => {
      const updatedItem = updatedMedia.find(updated => updated.id === item.id)
      return updatedItem || item
    }))

    setSelectedMedia([])
    setAvailableConfirmation({ show: false, count: 0 })
  }

  const AvailableConfirmationDialog = () => (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="mx-auto flex min-h-10 w-fit min-w-[21.25rem] items-center rounded-full bg-black pl-3 pr-2 text-white shadow-xl shadow-black/25 before:pointer-events-none before:absolute before:inset-px before:rounded-full before:shadow-[inset_0_1px_0] before:shadow-white/6">
        <div className="mr-2 flex items-center">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8.0002" r="5.8" fill="#D9D9DE" fillOpacity="0.1" stroke="#D9D9DE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 6.3998C8.44182 6.3998 8.8 6.04163 8.8 5.5998C8.8 5.15798 8.44182 4.7998 8 4.7998C7.55817 4.7998 7.2 5.15798 7.2 5.5998C7.2 6.04163 7.55817 6.3998 8 6.3998ZM8 7.9998C7.55817 7.9998 7.2 8.35798 7.2 8.7998V10.3998C7.2 10.8416 7.55817 11.1998 8 11.1998C8.44182 11.1998 8.8 10.8416 8.8 10.3998V8.7998C8.8 8.35798 8.44182 7.9998 8 7.9998Z" fill="#D9D9DE"></path>
          </svg>
        </div>
        <div className="whitespace-nowrap pr-2.5 font-book">
          Mark {availableConfirmation.count} media as available?
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setAvailableConfirmation({ show: false, count: 0 })}
            className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.gray.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.1)] [--button-color-ring:theme(colors.gray.500/0.4)] px-2 min-w-[3.25rem]"
            type="button"
          >
            <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">Cancel</span>
          </button>
          <button
            onClick={markSelectedMediaAvailable}
            className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.green.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.2)] [--button-color-ring:theme(colors.green.500/0.4)] px-2 min-w-[3.25rem]"
            type="button"
          >
            <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">
              Confirm
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const updateMediaItem = async (id: string, updates: Partial<Media>) => {
    const { data, error } = await supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating media item:', error);
    } else if (data) {
      setData(prevData => prevData.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Media</h1>
          <div className="text-sm text-muted-foreground">{filteredData.length} of {data.length} items</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Settings</Button>
          <Button>New Media</Button>
        </div>
      </div>

      <Tabs value={selectedMediaType} onValueChange={setSelectedMediaType} className="mb-6 w-full border-b">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0">
          {mediaTypes.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="relative h-9 rounded-none border-b-2 border-b-transparent px-10 pb-4 pt-2 font-semibold data-[state=active]:border-b-primary"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            {/* <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /> */}
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-r-none border-r0 px-2sm:px-4 flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    {searchColumn === 'all' ? 'All Columns' : searchColumn.charAt(0).toUpperCase() + searchColumn.slice(1)}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSearchColumn('all')}>All Columns</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSearchColumn('name')}>Name</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSearchColumn('type')}>Type</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSearchColumn('city')}>City</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSearchColumn('price')}>Price</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input 
                placeholder={`Search ${searchColumn === 'all' ? 'all columns' : searchColumn}`}
                className="rounded-l-none border-muted bg-background flex-1" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-available"
              checked={showAvailableOnly}
              onCheckedChange={setShowAvailableOnly}
            />
            <label htmlFor="show-available" className="text-sm text-muted-foreground">
              Show available media only
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            {selectedMedia.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUnavailableConfirmation({ show: true, count: selectedMedia.length })}
                >
                  Mark as Unavailable
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAvailableConfirmation({ show: true, count: selectedMedia.length })}
                >
                  Mark as Available
                </Button>
              </>
            )}
          </div>
          <div>
            {selectedMedia.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Export as Proposal ({selectedMedia.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('ppt')}>
                    Export to PowerPoint
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {Object.keys(activeFilters).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.type?.map((type) => (
              <div key={type} className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Type</span>
                <Badge 
                  variant="secondary" 
                  className="bg-muted-foreground/20 hover:bg-muted-foreground/30 pr-1"
                >
                  {type}
                  <button 
                    onClick={() => setActiveFilters(prev => ({
                      ...prev,
                      type: prev.type?.filter(t => t !== type)
                    }))}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-1"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            ))}
            {activeFilters.availability && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2 py-1">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Availability</span>
                <Badge 
                  variant="secondary" 
                  className="bg-muted-foreground/20 hover:bg-muted-foreground/30 pr-1"
                >
                  {activeFilters.availability}
                  <button 
                    onClick={() => setActiveFilters(prev => ({
                      ...prev,
                      availability: undefined
                    }))}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-1"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-8 mt-6">
        <div className="col-span-2">
          {isLoading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredData} 
              onRowClick={handleRowClick} 
              onRowSelect={handleRowSelection}
              selectedItemId={selectedItemId}
              selectedItems={selectedMedia}
            />
          )}
        </div>
        <div className="sticky top-8 border-l pl-8 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="pr-8 pb-8">
            <SelectedMediaDetails
              selectedItem={selectedItem ? {...selectedItem, image_urls: selectedItem.image_urls || [], traffic: String(selectedItem.traffic), availability: String(selectedItem.availability)} : null}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              handleReplaceImage={handleReplaceImage}
              handleAddImage={handleAddImage}
              handleDeleteImage={handleDeleteImage}
            />
          </div>
        </div>
      </div>

      {showUploadConfirm && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="mx-auto flex min-h-10 w-fit min-w-[21.25rem] items-center rounded-full bg-black pl-3 pr-2 text-white shadow-xl shadow-black/25 before:pointer-events-none before:absolute before:inset-px before:rounded-full before:shadow-[inset_0_1px_0] before:shadow-white/6">
            <div className="mr-2 flex items-center">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8.0002" r="5.8" fill="#D9D9DE" fillOpacity="0.1" stroke="#D9D9DE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle>
                <path fillRule="evenodd" clipRule="evenodd" d="M8 6.3998C8.44182 6.3998 8.8 6.04163 8.8 5.5998C8.8 5.15798 8.44182 4.7998 8 4.7998C7.55817 4.7998 7.2 5.15798 7.2 5.5998C7.2 6.04163 7.55817 6.3998 8 6.3998ZM8 7.9998C7.55817 7.9998 7.2 8.35798 7.2 8.7998V10.3998C7.2 10.8416 7.55817 11.1998 8 11.1998C8.44182 11.1998 8.8 10.8416 8.8 10.3998V8.7998C8.8 8.35798 8.44182 7.9998 8 7.9998Z" fill="#D9D9DE"></path>
              </svg>
            </div>
            <div className="whitespace-nowrap pr-2.5 font-book">
              Upload {uploadPreviews.length} images?
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={handleUploadCancel}
                className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.gray.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.1)] [--button-color-ring:theme(colors.gray.500/0.4)] px-2 min-w-[3.25rem]"
                type="button"
              >
                <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">Cancel</span>
              </button>
              <button
                onClick={handleUploadConfirm}
                className="group relative inline-flex h-[1.75rem] select-none items-center justify-center rounded-full border border-[--button-color-border] bg-[--button-color-bg] text-sm font-medium outline-none transition after:transition focus-visible:ring-[--button-color-ring] relative overflow-hidden focus-visible:ring-[0.1875rem] focus-visible:ring-[--button-color-ring] shadow-[0_1.5px_2px_0_rgba(0,0,0,0.48)] [--button-color-bg:theme(colors.green.500)] [--button-color-icon:theme(colors.white/0.8)] [--button-color-text:theme(colors.white)] [--button-text-shadow:0px_1px_1px_theme(colors.black/0.6)] [--button-color-border:theme(colors.white/0.2)] [--button-color-ring:theme(colors.green.500/0.4)] px-2 min-w-[3.25rem]"
                type="button"
              >
                <span className="flex text-[--button-color-text] drop-shadow-[--button-text-shadow] transition-colors">
                  Confirm
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation.show && <DeleteConfirmationDialog />}
      {unavailableConfirmation.show && <UnavailableConfirmationDialog />}
      {availableConfirmation.show && <AvailableConfirmationDialog />}
    </div>
  )
}

