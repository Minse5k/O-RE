import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SettingsIcon from "@mui/icons-material/Settings";
import styled from "@emotion/styled";
import Router from "next/router";
import { useClickOther } from "../hooks/resetPageHook";
import { PAGE_ROLE, PAGE_USER_API, PATH, PAGE_API } from "../constants";
import axios from "../utils/axios";
import { useAppDispatch } from "../hooks/reduxHook";
import { delPageState, setSelectPageState } from "../slices/pageSlice";
import { setNavName } from "../slices/navNameSlice";
import CustomAlert from "./CustomAlert";
import { AlertColor } from "@mui/material";

const ITEM_HEIGHT = 48;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

type PageOptionDropDown = {
  role: string;
  pageId: number;
  pageName: string;
};

export default function PageOptionDropDown({
  role,
  pageId,
  pageName,
}: PageOptionDropDown) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const dispatch = useAppDispatch();
  const clickOther = useClickOther();

  const handlePageLeave = async (pageId: number) => {
    try {
      await axios.delete(`${PAGE_USER_API.LEAVE}/${pageId}`, {
        headers: { Authorization: localStorage.getItem("accessToken") },
      });
      dispatch(delPageState(pageId));
      dispatch(setSelectPageState({ idx: -1, pageId: -1 }));
    } catch (e: any) {
      setAlertMessage(e?.response?.data?.message);
      setSeverity("error");
      setAlertOpen(true);
    }
  };

  const deletePage = async () => {
    try {
      await axios.delete(`${PAGE_API.ADD}/${pageId}`, {
        headers: { Authorization: localStorage.getItem("accessToken") },
      });
      dispatch(delPageState(pageId));
      dispatch(setSelectPageState({ idx: -1, pageId: -1 }));
    } catch (error) {}
  };

  return (
    <div>
      <CustomAlert
        open={alertOpen}
        setOpen={setAlertOpen}
        message={alertMessage}
        severity={severity}
      ></CustomAlert>
      <IconContainer onClick={handleClick}>
        <SettingsIcon fontSize="small" style={{ fill: "#fff4f4" }} />
      </IconContainer>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch",
          },
        }}
      >
        {PAGE_ROLE.EDITOR.includes(role) && (
          <MenuItem
            onClick={() => {
              handleClose();
              Router.push({
                pathname: PATH.MANAGE_PAGE,
                query: { role: role, pageId: pageId },
              });
              clickOther();
              dispatch(setNavName(`${pageName} 페이지 설정`));
            }}
            style={{ fontSize: "12px" }}
          >
            페이지 설정
          </MenuItem>
        )}
        {!PAGE_ROLE.OWNER.includes(role) && (
          <MenuItem
            onClick={() => {
              handleClose();
              handlePageLeave(pageId);
            }}
            style={{ fontSize: "12px" }}
          >
            페이지 떠나기
          </MenuItem>
        )}

        {PAGE_ROLE.MAINTAINER.includes(role) && (
          <MenuItem
            onClick={deletePage}
            style={{ color: "red", fontSize: "12px" }}
          >
            페이지 삭제
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
