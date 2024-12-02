import Link from 'next/link';
import { cn } from '@/lib/utils';
import { supabase } from '@/services/supabaseClient';

{
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', hidden: true }, // Hidden link
    { name: 'Bookings', href: '/dashboard/bookings' },
    { name: 'Media', href: '/dashboard/media', isDefault: true }, // Default link
    { name: 'Invoices', href: '/dashboard/invoices' },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = '/auth'; // Redirect to login page
    } else {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-gray-900 text-white">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">OOH WORLD</h1>
      </div>
      <nav className="flex flex-col flex-grow px-4 py-6 space-y-2">
        {navigation
          .filter((item) => !item.hidden) // Hide links with `hidden: true`
          .map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700',
                'focus:outline-none focus:ring focus:ring-gray-700'
              )}
            >
              {item.name}
            </Link>
          ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md w-full text-sm font-medium hover:bg-red-500"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
