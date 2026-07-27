
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import firebaseApp from '@/lib/firebase';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { FormError } from "@/components/forms/form-error";
import { FormSuccess } from "@/components/forms/form-success";

const UpdateProfileImage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();
  const session = useSession();
  const { update } = useSession();
  const storage = getStorage(firebaseApp, 'gs://ripplez-blog.appspot.com');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setImage(event.target.files[0]);
  };

  const uploadImageToFirebase = async () => {
    if (!image) return;

    const fileName = new Date().getTime() + '-' + image.name;
    const storageRef = ref(storage, `profile_images/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading image to Firebase:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => updateProfileImage(url))
          .catch((error) => {
            console.error('Error getting download URL from Firebase:', error);
          });
      }
    );
  };

  const updateProfileImage = async (imageUrl: string) => {
    const userId = session.data?.user?.id; 

    try {
      const res = await fetch('/api/user/update-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          imageURL: imageUrl,
        }),
      });

      const data = await res.json();
      console.log(data); // Log response from the API

      if (data.success) {
        update();
        const success = 'Profile Photo Updated!';
        setSuccess(success); 
      } else {
        const error = 'Failed to update profile photo';
        setError(error);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  return (
    <div className='mb-10'>
     <div className=' gap-1 grid grid-cols-2'>
      <div className='flex flex-col'>
      <h3 className='font-bold mb-2'>Update Profile Image</h3>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {uploadProgress !== null && <p>Upload Progress: {uploadProgress}%</p>}
      </div>
      <Button onClick={uploadImageToFirebase}>Update Image</Button>
      </div>
      <div className='mt-4'>
       <FormError message={error} />
       <FormSuccess message={success} />
       </div>
    
  </div>

  );
};

export default UpdateProfileImage;
