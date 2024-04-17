"""
URL configuration for WebApp_Bert project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from Deploy_Modele_Bert import views
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [

    path('admin/', admin.site.urls),
    path('predict/', views.predict, name="predict"),
    path('', views.index),
    path('emplois/', views.index),
    path('products/', views.index),
    path('activites/', views.index),
    path('download_transformed_csv/', views.download_transformed_csv, name='download_transformed_csv'),
    path('download_transformed_csv/<slug:temp_dir>/', views.download_transformed_csv, name='download_temp_dir'),
    path('download_page/', views.download_page, name='download_page'),
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('get-models-details/', views.get_models_details, name='get_models_details'),
    path('upload/', views.UploadFiles.as_view(), name='upload-files'),
    path('upload/<slug:temp_dir>/', views.UploadFiles.as_view(), name='upload-files'),
    #path('stream-traitement/<slug:temp_dir>/', views.start_codification, name='stream'),
    path('stream-traitement/<slug:temp_dir>/<slug:model>/', views.start_codification, name='stream')
    

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
