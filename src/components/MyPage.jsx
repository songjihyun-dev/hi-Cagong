import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useGetReviews } from "./Hooks/useGetReviews";
import { useRecoilValue } from "recoil";
import { currentUserUid } from "./atom";
import { authService, dbService } from "../firebase";
import { ChangeProfileModal } from "./ChangeProfile";
import { deleteDoc, doc } from "firebase/firestore";
import { ButtonWrap } from "./Auth/Login";
import CustomButton from "./common/CustomButton";
import AuthModal, { AuthTitle } from "./Auth/AuthModal";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

const SecitonWrap = styled.div`
  display: flex;
  width: calc(100% - 160px);
  overflow-y: scroll;
`;

const UserProfileContainer = styled.div`
  background: #f6f6f6;
  width: 220px;
  height: 280px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 16px 20px;
  position: relative;
  text-align: center;
`;

const UserProfileImg = styled.img`
  height: 120px;
  width: 120px;
  border-radius: 100%;
  margin-top: 50px;
  object-fit: cover;
`;

const UserNickname = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 30px;
  color: #000000;
  margin-top: 15px;
`;

const UserEmail = styled.div`
  font-weight: 700;
  font-size: 14px;
  line-height: 30px;
  color: #adb8cc;
`;

const UserProfileChangeButton = styled.button`
  width: 24px;
  height: 24px;
  background: #ffffff;
  box-shadow: 0px 2px 5px rgba(38, 51, 77, 0.03);
  border-radius: 100px;
  border: none;
  color: black;
  position: absolute;
  right: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserProfilChangeMenu = styled.div`
  position: absolute;
  right: -24%;
  top: 10%;
  text-align: left;
  font-size: 12px;
  background-color: whitesmoke;
  border-radius: 5px;

  & div {
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 8px 12px;
    margin: -1px 0;
  }
  & div:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

const ReviewList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 3fr));
  grid-template-rows: repeat(auto-fill, 330px);
  gap: 12px 16px;
  width: 100%;
  margin-right: 40px;
`;

const Review = styled.div`
  border: 1px solid #ebebeb;
  border-radius: 5px;
  height: 320px;

  span {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ReviewImg = styled.div`
  background: ${(props) => `url(${props.ImgSrc})`};
  background-size: cover;
  width: 100%;
  height: 50%;
`;

const ReviewDesc = styled.div`
  position: relative;
  padding: 16px;
  border-radius: 5px;
`;

const ReviewTitle = styled.div`
  padding-top: 1px;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const StoreGoodPoint = styled.div`
  font-size: 12px;
  color: #adb8cc;
  font-weight: 700;
  margin-bottom: 40px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MyTitle = styled.h2`
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 15px;
  border-radius: 5px;
`;

const DeleteButton = styled.button`
  padding: 6px 8px;
  border: 1px solid #dedede;
  border-radius: 2px;
  color: red;
  background-color: transparent;
  position: absolute;
  bottom: -28px;
  right: 12px;
  cursor: pointer;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-items: flex-start;
  margin: 80px 40px 40px 40px;
`;

export const MyPage = () => {
  const userUid = useRecoilValue(currentUserUid);
  const { reviews } = useGetReviews("uid", userUid);
  const auth = authService;
  const [profileSetting, setProfileSetting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isLoginIn, setIsLoginIn] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [url, setUrl] = useState();

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoginIn(true);
      }
    });

    const noimageFunc = async () => {
      const storage = getStorage();
      const reference = ref(storage, `asset/noimage.png`);
      await getDownloadURL(reference).then((url) => {
        setUrl(url);
      });
    };

    if (url === undefined) {
      noimageFunc();
    }
  }, []);

  const openConfirmModal = (event) => {
    setTargetId(event.target.id);
    setConfirmModal((prev) => !prev);
  };

  const delete_comment = async () => {
    if (targetId) {
      try {
        await deleteDoc(doc(dbService, "review", targetId));
        window.location.reload();
        setConfirmModal((prev) => !prev);
      } catch (error) {
        alert(error);
      }
    }
  };

  return (
    <>
      {confirmModal && (
        <AuthModal>
          <AuthTitle>정말로 삭제할까요?</AuthTitle>
          <p>삭제하면 되돌릴 수 없습니다.</p>
          <ButtonWrap>
            <CustomButton
              bgColor="#000"
              height={12}
              onClick={() => setConfirmModal((prev) => !prev)}
            >
              취소
            </CustomButton>
            <CustomButton
              onClick={() => delete_comment()}
              bgColor="#a23333"
              height={12}
              type="submit"
            >
              삭제
            </CustomButton>
          </ButtonWrap>
        </AuthModal>
      )}
      {openModal && (
        <ChangeProfileModal
          setProfileSetting={setProfileSetting}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}
      <SecitonWrap>
        <SectionContainer>
          <MyTitle>내프로필</MyTitle>
          <UserProfileContainer>
            <UserProfileChangeButton
              onClick={() => setProfileSetting((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faEllipsis} size="1x" color="#C3CAD9" />
            </UserProfileChangeButton>
            {profileSetting && (
              <UserProfilChangeMenu>
                <div onClick={() => setOpenModal(true)}>프로필 변경</div>
              </UserProfilChangeMenu>
            )}
            {isLoginIn && (
              <>
                <UserProfileImg
                  src={auth.currentUser?.photoURL ?? url}
                  alt=""
                />
                <UserNickname>
                  {auth.currentUser?.displayName ?? "닉네임 없음"}
                </UserNickname>
              </>
            )}
            <UserEmail>{auth.currentUser?.email}</UserEmail>
          </UserProfileContainer>
        </SectionContainer>
        <SectionContainer style={{ width: "100%" }}>
          <MyTitle>내가쓴리뷰</MyTitle>
          <ReviewList>
            {reviews &&
              reviews.map((review) => {
                return (
                  <Review key={review.createAt}>
                    <ReviewImg ImgSrc={review.image} alt="" />
                    <ReviewDesc>
                      <ReviewTitle>{review.reviewTitle}</ReviewTitle>
                      <StoreGoodPoint>{review.good}</StoreGoodPoint>
                      <DeleteButton
                        id={review.docId}
                        onClick={(event) => openConfirmModal(event)}
                      >
                        삭제하기
                      </DeleteButton>
                    </ReviewDesc>
                  </Review>
                );
              })}
          </ReviewList>
        </SectionContainer>
      </SecitonWrap>
    </>
  );
};
