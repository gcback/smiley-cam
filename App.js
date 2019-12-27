import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity, Platform } from 'react-native';
import styled from 'styled-components';

import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import * as FaceDetector from 'expo-face-detector';
import * as MediaLibrary from 'expo-media-library';

const {width, height} = Dimensions.get('window');
const ALBUM_NAME = 'Smiley Cam';

const CenterView = styled.View`
  flex: 1;
  background: cornflowerblue;
  align-items: center;
  justify-content: center;
`;

const Text = styled.Text`
  color: white;
  font-size: 22px;
`;

const IconBar = styled.View`
  margin-top: 50px;

`;

export default function App() {
  const [ hasPermission, setHasPermission ] = useState(null);
  const [ cameraType, setCameraType ] = useState(Camera.Constants.Type.back);
  const [ smileDetected, setSmileDetected ] = useState(false);
  let cameraRef = React.createRef();
 
  const switchCameraType = () => {
    if (cameraType === Camera.Constants.Type.front) {
      setCameraType(Camera.Constants.Type.back);
    } else {
      setCameraType(Camera.Constants.Type.front);
    }
  }

  const onFacesDetected = async ({faces}) => {
    const face = faces[0];

    if (face) {
      if (face.smilingProbability > 0.7) {
        setSmileDetected(true);

        await takePhoto();

        console.log(`smile: ${face.smilingProbability} take photo`);
      }
    }
  }

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        let { uri } = await cameraRef.current.takePictureAsync({
          quality: 1, 
        });
  
        if (uri) {
          await savePhoto(uri);
        }
      }
    } catch(error) {
      alert(error);
    } finally {
      setSmileDetected(false);
    }
  }

  const savePhoto = async uri => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(uri);
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
       
        if (album === null) {
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission == null)
    return (
      <CenterView>
        <ActivityIndicator /></CenterView>
  )
  
  if (hasPermission === false) {
    return (
      <CenterView>
        <Text>Don't have permission for this</Text>
      </CenterView>
    );
  }
 
  return (
    <CenterView>
      {/* <Text>Has Permission</Text> */}
      <Camera 
        style={{ 
          width: width-40, 
          height: height / 1.5, 
          borderRadius: 10,
          overflow: 'hidden'
          }}
        type={cameraType}
        onFacesDetected={smileDetected ? null : onFacesDetected}
        faceDetectorSettings={ {
          runClassifications: FaceDetector.Constants.Classifications.all,
          minDetectionInterval: 1000,
        }}
        ref = {cameraRef}
      />
      <IconBar>
        <TouchableOpacity onPress={switchCameraType}>
          <MaterialIcons 
            name={ cameraType === Camera.Constants.Type.front 
              ? 'camera-rear' : 'camera-front'
            }
            color='white'
            size={50} 
          />
        </TouchableOpacity>
      </IconBar>
    </CenterView>
  );

  
} // App 