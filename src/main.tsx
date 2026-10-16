import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GalleryApp } from './gallery/GalleryApp'
import { SampleRunner } from './runner/SampleRunner'
import './shared/base.css'

const isRunner = window.location.pathname.includes('/runner')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isRunner ? <SampleRunner /> : <GalleryApp />}</StrictMode>,
)
