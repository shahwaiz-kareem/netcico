"use client";
import { useContext, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { usePathname } from 'next/navigation';
import { blogSchema } from '../../lib/validation/BlogSchema';
import { zodResolver } from "@hookform/resolvers/zod"
import { ThemeContext } from '@/context/ThemeContext';
import Editor from '../editor/Editor';
import ThumbnailForm from './ThumbnailForm';
import { updateBlog } from '@/actions/blog.action';
import { Create_JS_TOOLS } from "@/components/editor/tools";
import Preview from './Preview';
import NavigationBtns from './NavigationBtns';
import { uploadThumbnail } from '@/actions/upload.action';
const steps = [
  {
    step: 0,
    name: "Basic Information",
  },
  {
    step: 1,
    name: "Post Content",
  },
  {
    step: 2,
    name: "Publish",
  },
]



const BlogForm = ({ isUpdate, updateName, updateSlug, updateCategory, updateAuthor, updateMetaTitle, updateMetaDescription, updateTags, updateThumbnail, itemId, updateAltText, updateContent }) => {
  const context = useContext(ThemeContext)
  const { width, data, setData, thumbnailUrl, thumbnailFormData, setThumbnailUrl, setSubmitSuccess, submitSuccess, updatedThumb, setThumbnailFormData } = context;
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [successDisplay, setSuccessDisplay] = useState("hidden");
  const [draftId, setDraftId] = useState("");
  const [updatedAsDraft, setUpdatedAsDraft] = useState(false);
  const [intervalDelay, setIntervalDelay] = useState(null);
  const { success, message } = submitSuccess;
  let pathname = usePathname()
  let onPage = pathname.split("/dashboard/").join(" ").split("/")[0].trim();

  useEffect(() => {
    if (isUpdate) {
      setData(JSON.parse(updateContent));
      setThumbnailUrl(updateThumbnail);
    }
    else {
      setThumbnailUrl("");
    }
    setThumbnailFormData(new FormData())
    setSubmitSuccess({
      success: null,
      message: ""
    })
  }, [])

  const { register, getValues, setValue, formState } = useForm({
    defaultValues: {
      name: updateName || "",
      slug: updateSlug || "",
      author: updateAuthor || "Shahwaiz Karim",
      category: updateCategory || "",
      metaTitle: updateMetaTitle || "",
      metaDescription: updateMetaDescription || "",
      tags: updateTags || "",
      thumbnail: updateThumbnail || "",
      altText: updateAltText || ""
    },
    mode: 'onBlur',
    resolver: zodResolver(blogSchema)
  });

  const { name, slug, author, altText, category, metaDescription, metaTitle, tags } = getValues()


  const uploadThumbnailToServer = async () => {
    const responce = await uploadThumbnail(thumbnailFormData, onPage)
    const { success, thumbnailUrl } = responce
    if (success) {
      if (isUpdate && updatedThumb) {
        try {
          await fetch("/api/upload/image/delete", {
            method: "Delete",
            body: JSON.stringify({
              url: updateThumbnail
            })
          })
        } catch (error) {
          console.log("Your thumbnail was uploaded but previous one not deleted " + error)
        }
      }
    }
    return { success, thumbnailUrl }
  }

  const saveDataAsDraft = async () => {
    if (!isUpdate && !updatedAsDraft) {
      try {
        await uploadThumbnail(thumbnailFormData, onPage).then(async (res) => {
          setThumbnailUrl(res.thumbnailUrl)
          const randomId = `${Math.random().toString(32).substr(2, 9)}${Date.now()}`
          setDraftId(randomId.toString())
          await updateBlog({
            name, slug, itemId: randomId, author,
            content: JSON.stringify(data)
            , altText, category, metaDescription,
            metaTitle, tags,
            thumbnail: res.thumbnailUrl
          })
          setUpdatedAsDraft(true)
          return randomId
        })
      } catch (error) {
        await fetch("/api/upload/image/delete", {
          method: "Delete",
          body: JSON.stringify({
            url: thumbnailUrl
          })
        })
      }
    }

  }

  const slugGenerator = (name) => {
    const slug = structuredClone(name).trim().toLowerCase().split(" ").join("-")
    setValue("slug", slug)
  }
  const prevStep = () => {
    if (currentStep.step == 0 || success) return
    setCurrentStep(steps[currentStep.step - 1])
  }

  const nextStep = async () => {
    if (currentStep.step === steps.length - 1) return;
    console.log(formState);
    if (isUpdate && formState.isValid) setCurrentStep(steps[currentStep.step + 1])
    if (formState.isValid && !success && thumbnailUrl !== "") {
      setCurrentStep(steps[currentStep.step + 1])
    }
  }

  const useInterval = (callback, delay) => {
    //
    const savedCallback = useRef();
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      const tick = () => {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  useEffect(() => {
    if (currentStep.step === 1) {
      !updatedAsDraft && (async () => await saveDataAsDraft())()
      setIntervalDelay(20000)
    }
    else {
      setIntervalDelay(null)
    }
  }, [currentStep.step])



  useInterval(async () => {
    const sendData = { itemId: isUpdate ? itemId : draftId, content: JSON.stringify(data) }
    await updateBlog(sendData)
  }, intervalDelay)



  const hideTag = () => {
    setTimeout(() => {
      setSuccessDisplay("hidden")
    }, 3000);
  }



  const PublishBlog = async () => {
    await uploadThumbnailToServer().then(async (res) => {
      const result = await updateBlog({
        name, slug, itemId: isUpdate ? itemId : draftId, isActive: true,
        author, altText, category,
        content: JSON.stringify(data),
        metaDescription, metaTitle, tags,
        thumbnail: res.thumbnailUrl
      })
      setSubmitSuccess({
        success: result.success,
        message: result.data !== null && result.data
      })
      setSuccessDisplay("flex")
      hideTag()
    })
  }
  const saveAsDraft = async () => {
    await uploadThumbnailToServer().then(async (res) => {
      const result = await updateBlog({
        name, slug,
        isActive: false,
        itemId: isUpdate ?
          itemId : draftId,
        author, altText,
        content: JSON.stringify(data),
        category, metaDescription,
        itemId: isUpdate ? itemId : draftId,
        metaTitle,
        tags,
        thumbnail: res.thumbnailUrl
      })
      setSubmitSuccess({
        success: result.success,
        message: result.data !== null && result.data
      })
      setSuccessDisplay("flex")
      hideTag()
    })

  }

  return (
    <section className="w-full h-full py-4  rounded-lg">
      <div className={'px-6 flex flex-col  h-full  items-center   mx-auto  gap-2 ' + `${currentStep.step === 1 ? "w-full" : width}`}>
        <h1 className={'text-2xl w-full font-bold ' + `${currentStep.step === 1 ? "text-center mx-auto" : ""}`}>{isUpdate ? "Update Blog" : "Create a new Blog"} ({currentStep.name})</h1>

        {
          currentStep.step === 0 &&
          <section className='w-full flex h-full items-center justify-between'>
            <div className='flex relative flex-col gap-8'>
              <input type="text" onInput={(e) => slugGenerator(e.target.value)} placeholder='Name' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("name")} />
              <input type="text" placeholder='Slug' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("slug")} />
              <input type="text" placeholder='Author' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("author")} />

              <select {...register("category")} aria-placeholder='Category' className=' pr-4 flex  py-3 rounded-lg bg-zinc-900 text-white outline-none gap-2' >

                <option value="Scientist">Scientist</option>
                <option value="Driver">Driver</option>
                <option value="Teacher">Teacher</option>
              </select >

            </div>
            <div className='flex flex-col gap-8'>
              <input type="text" placeholder='Title(SEO)' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("metaTitle")} />
              <textarea placeholder='description(SEO)' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("metaDescription")} />
              <input type="text" placeholder='tags' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("tags")} />
            </div>
            <div className='flex flex-col gap-8'>
              <ThumbnailForm isUpdate={isUpdate} updateThumbnailUrl={updateThumbnail} />
              <input type="text" placeholder='Alternative Text' className='px-2 py-3 rounded-lg bg-zinc-900 outline-none' {...register("altText")} />
            </div>
          </section>
        }
        {
          currentStep.step === 1 &&
          <Editor tools={Create_JS_TOOLS} />
        }
        {
          currentStep.step === 2 &&
          <Preview NameOrTitle={name} PublishFunc={PublishBlog} altText={altText} message={message} saveAsDraftFunc={saveAsDraft} success={success} author={author} slug={slug} category={category} thumbnailUrl={thumbnailUrl} successDisplay={successDisplay} />
        }
        <NavigationBtns prevStepFunc={prevStep} nextStepFunc={nextStep} />
      </div>
    </section >

  )
}

export default BlogForm


